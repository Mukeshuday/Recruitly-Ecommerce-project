"use client";

import React from "react";

// ✅ PriceCell safely handles missing/null values
export const PriceCell = ({ value }) => {
  if (value == null) return "";
  return `₹${Number(value).toFixed(2)}`;
};

// ✅ StockBadge safely reads data & applies styles
export const StockBadge = ({ data }) => {
  if (!data) return null;

  const { currentStock = 0, minimumStock = 0, maximumStock = Infinity } = data;

  const status =
    currentStock < minimumStock
      ? "low"
      : currentStock > maximumStock
      ? "over"
      : "ok";

  const map = {
    low: { bg: "#ff4d4f", text: "Low" },
    ok: { bg: "#52c41a", text: "OK" },
    over: { bg: "#faad14", text: "Over" },
  };

  const { bg, text } = map[status];

  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 12,
        color: "#fff",
        fontSize: 12,
        background: bg,
      }}
    >
      {text} ({currentStock})
    </span>
  );
};

// ✅ ImageThumb with fallback + safe access
export const ImageThumb = ({ value }) => {
  const src =
    (Array.isArray(value) && value.length > 0 && value[0]) || "/placeholder.png";

  return (
    <img
      src={src}
      alt="product"
      style={{
        width: 40,
        height: 40,
        objectFit: "cover",
        borderRadius: 4,
      }}
    />
  );
};
