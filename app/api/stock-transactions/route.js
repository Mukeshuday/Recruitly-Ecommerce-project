import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import StockTransaction from '@/lib/models/StockTransaction';

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const page  = parseInt(searchParams.get('page')  || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const skip  = (page - 1) * limit;

  const productId = searchParams.get('productId');
  const type      = searchParams.get('type'); // IN|OUT|ADJUSTMENT
  const from      = searchParams.get('from'); // ISO date
  const to        = searchParams.get('to');   // ISO date

  const filter = {};
  if (productId) filter.productId = productId;
  if (type) filter.type = type;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to)   filter.createdAt.$lte = new Date(to);
  }

  const [items, total] = await Promise.all([
    StockTransaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    StockTransaction.countDocuments(filter)
  ]);

  return NextResponse.json({ page, limit, total, items });
}
