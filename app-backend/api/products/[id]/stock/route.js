import express from "express"
import { dbConnect } from '../../../../lib/db.js';
import Product from '../../../../lib/models/Product.js';
import StockTransaction from '../../../../lib/models/StockTransaction.js';

const router = express.Router();

router.post("/",async(req,res)=>{
  await dbConnect();
  const { type, quantity, reason, referenceId, performedBy, notes } = await req.json();

  // Basic validation
  if (!type || !['IN', 'OUT', 'ADJUSTMENT'].includes(type)) {
    return res.json({ error: 'Invalid type' }, { status: 400 });
  }
  if (typeof quantity !== 'number' || quantity === 0) {
    return res.json({ error: 'Quantity must be a non-zero number' }, { status: 400 });
  }
  if (!reason) {
    return res.json({ error: 'Reason is required' }, { status: 400 });
  }

  const product = await Product.findById(params.id);
  if (!product) {
    return res.json({ error: 'Product not found' }, { status: 404 });
  }

  let delta;
  if (type === 'IN') {
    if (quantity < 0) return NextResponse.json({ error: 'IN quantity must be positive' }, { status: 400 });
    delta = quantity;
  } else if (type === 'OUT') {
    if (quantity < 0) return NextResponse.json({ error: 'OUT quantity must be positive' }, { status: 400 });
    delta = -quantity;
  } else if (type === 'ADJUSTMENT') {
    // Allow signed adjustments (+/-)
    delta = quantity;
  }

  const newStock = product.currentStock + delta;
  if (newStock < 0) {
    return res.json({ error: 'Stock cannot go negative' }, { status: 400 });
  }

  product.currentStock = newStock;
  await product.save();

  await StockTransaction.create({
    productId: product._id,
    type,
    quantity: delta, // save signed quantity
    reason,
    referenceId,
    performedBy,
    notes,
  });

  return res.json({ ok: true, currentStock: product.currentStock });
});

export default router;
