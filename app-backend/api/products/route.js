import express from "express";
import { dbConnect } from "../../lib/db.js";
import Product from "../../lib/models/Product.js";
import Supplier from "../../lib/models/Supplier.js";

const router = express.Router();

// 📌 GET /api/products
router.get("/", async (req, res) => {
  await dbConnect();

  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      category,
      brand,
      supplierId,
      isActive,
      stock, // low | ok | over
      sort,
      includeSupplier,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (supplierId) filter.supplierId = supplierId;
    if (isActive !== undefined) {
      if (isActive === "true") filter.isActive = true;
      if (isActive === "false") filter.isActive = false;
    }
    if (stock) {
      if (stock === "low") filter.$expr = { $lt: ["$currentStock", "$minimumStock"] };
      else if (stock === "over") filter.$expr = { $gt: ["$currentStock", "$maximumStock"] };
      else if (stock === "ok")
        filter.$and = [
          { $expr: { $gte: ["$currentStock", "$minimumStock"] } },
          { $expr: { $lte: ["$currentStock", "$maximumStock"] } },
        ];
    }

    // Sorting
    const sortObj = {};
    if (sort) {
      for (const key of sort.split(",")) {
        const field = key.trim();
        if (!field) continue;
        if (field.startsWith("-")) sortObj[field.slice(1)] = -1;
        else sortObj[field] = 1;
      }
    } else {
      sortObj.createdAt = -1;
    }

    const query = Product.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit));
    if (includeSupplier === "true") query.populate("supplierId", "name email phone");

    const [items, total] = await Promise.all([
      query.lean(),
      Product.countDocuments(filter),
    ]);

    res.json({ page: parseInt(page), limit: parseInt(limit), total, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 POST /api/products
router.post("/", async (req, res) => {
  await dbConnect();

  try {
    const body = req.body;
    const products = Array.isArray(body) ? body : [body];

    const required = ["name", "sku", "category", "brand", "price", "costPrice", "currentStock"];

    for (const product of products) {
      for (const f of required) {
        if (!product[f]) {
          return res.status(400).json({ error: `Field "${f}" is required` });
        }
      }

      if (product.supplierId) {
        const exists = await Supplier.exists({ _id: product.supplierId });
        if (!exists) {
          return res.status(400).json({ error: "Invalid supplierId" });
        }
      }
    }

    const created = await Product.insertMany(products, { ordered: true });
    res.status(201).json(created);
  } catch (e) {
    if (e.code === 11000) {
      res.status(409).json({ error: "SKU must be unique" });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
});

export default router;
