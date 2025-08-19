import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Product from '@/lib/models/Product';

export async function GET(_, { params }) {
  await dbConnect();
  const product = await Product.findById(params.id).populate('supplierId','name email phone').lean();
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req, { params }) {
  await dbConnect();
  const patch = await req.json();
  try {
    const updated = await Product.findByIdAndUpdate(params.id, patch, { new: true, runValidators: true });
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(_, { params }) {
  await dbConnect();
  const deleted = await Product.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
