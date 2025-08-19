import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import StockTransaction from "@/lib/models/StockTransaction";

export async function GET(request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const product = searchParams.get("product");
    const type = searchParams.get("type");

    const query = {};
    if (from && to) query.createdAt = { $gte: new Date(from), $lte: new Date(to) };
    if (product) query.productId = product;
    if (type) query.type = type;

    const transactions = await StockTransaction.find(query)
      .sort({ createdAt: 1 }) // for trends
      .lean();

    // Transform data for chart
    const trends = transactions.map((t) => ({
      date: t.createdAt.toISOString().split("T")[0],
      quantity: t.quantity,
      type: t.type,
    }));

    return NextResponse.json(trends);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
