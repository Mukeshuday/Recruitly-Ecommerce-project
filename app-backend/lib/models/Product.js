import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    sku:         { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, trim: true },
    category:    { type: String, required: true, index: true },
    brand:       { type: String, required: true, index: true },

    price:       { type: Number, required: true, min: 0 },
    costPrice:   { type: Number, required: true, min: 0 },

    currentStock:{ type: Number, required: true, default: 0, min: 0 },
    minimumStock:{ type: Number, default: 10, min: 0 },
    maximumStock:{ type: Number, default: 1000, min: 0 },

    supplierId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }, // 🔑 relation to Supplier

    isActive:    { type: Boolean, default: true },
    tags:        [{ type: String, trim: true }],

  },
  { timestamps: true } // 🔑 auto handles createdAt + updatedAt
);

// Index for faster searching/filtering
ProductSchema.index({ name: "text", description: "text", tags: "text" });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
