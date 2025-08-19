import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Product from '@/lib/models/Product';
import Supplier from '@/lib/models/Supplier';

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);

  const page  = parseInt(searchParams.get('page')  || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const skip  = (page - 1) * limit;

  const search   = searchParams.get('search') || '';
  const category = searchParams.get('category');
  const brand    = searchParams.get('brand');
  const supplier = searchParams.get('supplierId');
  const isActive = searchParams.get('isActive');
  const stock    = searchParams.get('stock'); // low|ok|over

  const sort     = searchParams.get('sort'); // e.g. "-createdAt,price"
  const includeSupplier = searchParams.get('includeSupplier') === 'true';

  const filter = {};
  if (search) {
    // text search fallback to regex for wider compatibility
    filter.$or = [
      { name:        { $regex: search, $options: 'i' } },
      { sku:         { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags:        { $regex: search, $options: 'i' } },
    ];
  }
  if (category) filter.category = category;
  if (brand)    filter.brand    = brand;
  if (supplier) filter.supplierId = supplier;
  if (isActive !== null && isActive !== undefined) {
    if (isActive === 'true')  filter.isActive = true;
    if (isActive === 'false') filter.isActive = false;
  }
  if (stock) {
    if (stock === 'low')       filter.$expr = { $lt: ["$currentStock", "$minimumStock"] };
    else if (stock === 'over') filter.$expr = { $gt: ["$currentStock", "$maximumStock"] };
    else if (stock === 'ok')   filter.$and = [
      { $expr: { $gte: ['$currentStock', '$minimumStock'] } },
      { $expr: { $lte: ['$currentStock', '$maximumStock'] } },
    ];
  }

  const sortObj = {};
  if (sort) {
    for (const key of sort.split(',')) {
      const field = key.trim();
      if (!field) continue;
      if (field.startsWith('-')) sortObj[field.slice(1)] = -1;
      else sortObj[field] = 1;
    }
  } else {
    sortObj.createdAt = -1;
  }

  const query = Product.find(filter).sort(sortObj).skip(skip).limit(limit);
  if (includeSupplier) query.populate('supplierId', 'name email phone');
  const [items, total] = await Promise.all([query.lean(), Product.countDocuments(filter)]);
  return NextResponse.json({ page, limit, total, items });
}

export async function POST(req) {
  await dbConnect();
  const body = await req.json();

  // ensure body is an array
  const products = Array.isArray(body) ? body : [body];

  const required = ['name','sku','category','brand','price','costPrice','currentStock'];
  for (const product of products) {
    for (const f of required) {
      if (product[f] === undefined || product[f] === null || product[f] === '') {
        return NextResponse.json({ error: `Field "${f}" is required` }, { status: 400 });
      }
    }

    if (product.supplierId) {
      const exists = await Supplier.exists({ _id: product.supplierId });
      if (!exists) {
        return NextResponse.json({ error: 'Invalid supplierId' }, { status: 400 });
      }
    }
  }

  try {
    const created = await Product.insertMany(products, { ordered: true });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e.code === 11000) {
      return NextResponse.json({ error: 'SKU must be unique' }, { status: 409 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
