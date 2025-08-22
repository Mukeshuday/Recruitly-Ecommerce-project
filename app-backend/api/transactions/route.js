// app/api/transactions/route.js
import express from "express";
import { dbConnect } from "../../lib/db.js";
import Product from "../../lib/models/Product.js";
import StockTransaction from "../../lib/models/StockTransaction.js";


const router = express.Router();

// ✅ CREATE a stock transaction
router.post("/",async(req,res) => 
{
  try {
    await dbConnect();
    const body = await req.json();
    const { productId, type, quantity, reason, referenceId, performedBy, notes } = body;

    if (!productId || !type || !quantity || !reason) {
      return res.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch product
    const product = await Product.findById(productId);
    if (!product) {
      return res.json({ error: "Product not found" }, { status: 404 });
    }

    let stockChange = 0;
    if (type === "IN") {
      stockChange = quantity;
    } else if (type === "OUT") {
      if (product.currentStock < quantity) {
        return res.json({ error: "Insufficient stock" }, { status: 400 });
      }
      stockChange = -quantity;
    } else if (type === "ADJUSTMENT") {
      stockChange = quantity;
      if (product.currentStock + stockChange < 0) {
        return res.json({ error: "Adjustment would result in negative stock" }, { status: 400 });
      }
    } else {
      return res.json({ error: "Invalid transaction type" }, { status: 400 });
    }

    // ✅ Update product stock without triggering full validation
    await Product.findByIdAndUpdate(productId, {
      $inc: { currentStock: stockChange },
    });

    // Save transaction
    const transaction = await StockTransaction.create({
      productId,
      type,
      quantity,
      reason,
      referenceId,
      performedBy,
      notes,
    });

    return res.json({ success: true, transaction }, { status: 201 });
  } catch (error) {
    console.error("Transaction POST error:", error);
    return res.json({ error: "Internal server error" }, { status: 500 });
  }
}); 


// ✅ GET stock transactions (with filters)
router.get("/",async(req,res) => 
{
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit")) || 50;

    const query = {};
    if (productId) query.productId = productId;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await StockTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("productId", "name currentStock unitPrice");

    return res.json(transactions,{ status:200 });
  } catch (error) {
    console.error("Transaction GET error:", error);
    return res.json({ error: "Internal server error" }, { status: 500 });
  }
}); 

export default router;