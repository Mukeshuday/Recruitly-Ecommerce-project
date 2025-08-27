// app/api/transactions/route.js
import express from "express";
import { dbConnect } from "../../lib/db.js";
import Product from "../../lib/models/Product.js";
import StockTransaction from "../../lib/models/StockTransaction.js";

const router = express.Router();

// ✅ CREATE a stock transaction
router.post("/", async (req, res) => {
  try {
    await dbConnect();
    const body = req.body;
    const { productId, type, quantity, reason, referenceId, performedBy, notes } = body;

    if (!productId || !type || !quantity || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let stockChange = 0;
    if (type === "IN") {
      stockChange = quantity;
    } else if (type === "OUT") {
      if (product.currentStock < quantity) {
        return res.status(400).json({ error: "Insufficient stock" });
      }
      stockChange = -quantity;
    } else if (type === "ADJUSTMENT") {
      stockChange = quantity;
      if (product.currentStock + stockChange < 0) {
        return res.status(400).json({ error: "Adjustment would result in negative stock" });
      }
    } else {
      return res.status(400).json({ error: "Invalid transaction type" });
    }

    // ✅ Update product stock
    await Product.findByIdAndUpdate(productId, {
      $inc: { currentStock: stockChange },
    });

    const transaction = await StockTransaction.create({
      productId,
      type,
      quantity,
      reason,
      referenceId,
      performedBy,
      notes,
    });

    return res.status(201).json({ success: true, transaction });
  } catch (error) {
    console.error("Transaction POST error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ GET stock transactions (with filters)
router.get("/", async (req, res) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
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

    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Transaction GET error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
