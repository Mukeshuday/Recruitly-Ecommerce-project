// app-backend/api/analytics/route.js
import express from "express";

const router = express.Router();

// ✅ Root route - just a helper/info endpoint
router.get("/", (req, res) => {
  res.json({
    message: "Analytics API available",
    endpoints: {
      inventory: "/api/analytics/inventory",
      categories: "/api/analytics/categories",
      stockMovements: "/api/analytics/stock-movements",
    },
  });
});

export default router;
