import mongoose, { Schema } from 'mongoose';

const SupplierSchema = new Schema(
  {
    name:          { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true },
    email:         { type: String, required: true, trim: true, lowercase: true, unique: true },
    phone:         { type: String, trim: true },

    address: {
      street:  { type: String, trim: true },
      city:    { type: String, trim: true },
      state:   { type: String, trim: true },
      zipCode: { type: String, trim: true },
    },

    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 🔑 Index for faster search/filter
SupplierSchema.index({ name: 1, email: 1 });

export default mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);
