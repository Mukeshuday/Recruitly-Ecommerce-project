import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Product from '@/lib/models/Product';

export async function GET() {
  await dbConnect();
  const items = await Product.find({
    $expr: { $lt: ["$currentStock", "$minimumStock"] },
    isActive: true
  }).sort({ currentStock: 1 }).lean();

  return NextResponse.json({ total: items.length, items });
}
