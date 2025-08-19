import { dbConnect } from "@/lib/db";
import Product from "@/lib/models/Product";

export async function GET() {
  try {
    await dbConnect();

    const products = await Product.find({});
    const categorySummary = {};

    products.forEach((p) => {
      const category = p.category || "Uncategorized";
      if (!categorySummary[category]) {
        categorySummary[category] = { 
          category,
          productCount: 0,
          totalStock: 0,
          stockValue: 0,
          potentialRevenue: 0,
          lowStockCount: 0,
        };
      }

      categorySummary[category].productCount += 1;
      categorySummary[category].totalStock += p.currentStock;
      categorySummary[category].stockValue += p.costPrice * p.currentStock;
      categorySummary[category].potentialRevenue += p.price * p.currentStock;
      if (p.currentStock < p.minimumStock) {
        categorySummary[category].lowStockCount += 1;
      }
    });

    return Response.json(Object.values(categorySummary));
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
