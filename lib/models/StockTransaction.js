import mongoose, { Schema } from 'mongoose';

const StockTransactionSchema = new Schema(
  {
    productId:   { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    type:        { type: String, enum: ['IN','OUT','ADJUSTMENT'], required: true },
    // Quantity now supports signed numbers (negative for shrinkage, positive for additions)
    quantity:    { type: Number, required: true },
    reason:      { type: String, required: true },
    referenceId: { type: String },   // e.g. order ID, invoice ID, return ID
    performedBy: { type: String },   // user/admin making the change
    notes:       { type: String },   // free-text notes
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Index for faster queries (recent transactions first)
StockTransactionSchema.index({ createdAt: -1 });

export default mongoose.models.StockTransaction ||
  mongoose.model('StockTransaction', StockTransactionSchema);
