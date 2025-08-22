import express from "express";
import { dbConnect } from '../../../lib/db.js';
import Product from '../../../lib/models/Product.js';

const router = express.Router();
router.get("/",async(req,res)=> {
  await dbConnect();
  const items = await Product.find({
    $expr: { $lt: ["$currentStock", "$minimumStock"] },
    isActive: true
  }).sort({ currentStock: 1 }).lean();

  return res.json({ total: items.length, items });
});

export default router;