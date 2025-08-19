import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Supplier from '@/lib/models/Supplier';

export async function GET() {
  await dbConnect();
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(suppliers);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
    }

    const newSupplier = await Supplier.create(body);
    return NextResponse.json(newSupplier, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
