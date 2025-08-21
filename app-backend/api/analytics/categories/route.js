import express from "express";
import { dbConnect } from "../../../lib/db.js";
import Product from "../../../lib/models/Product.js";

const router = express.Router();


router.get("/api/analytics/categories",async(req,res) => {
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

    res.json(Object.values(categorySummary));
  } catch (error) {
    res.json({ error: error.message }, { status: 500 });
  }
});
