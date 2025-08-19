import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Supplier from '@/lib/models/Supplier';

export async function GET(_, { params }) {
  await dbConnect();
  try {
    const supplier = await Supplier.findById(params.id).lean();
    if (!supplier) return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    return NextResponse.json(supplier);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  await dbConnect();
  try {
    const body = await req.json();
    const updated = await Supplier.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_, { params }) {
  await dbConnect();
  try {
    const deleted = await Supplier.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
