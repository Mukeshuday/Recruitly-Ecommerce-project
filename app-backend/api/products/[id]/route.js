import express from "express"
import { dbConnect } from '../../../lib/db.js';
import Product from '../../../lib/models/Product.js';


const router = express.Router();
router.get("/",async(req,res)=>  {
  await dbConnect();
  const product = await Product.findById(params.id).populate('supplierId','name email phone').lean();
  if (!product) return res.json({ error: 'Not found' }, { status: 404 });
  res.json(product);
} );

router.put("/",async(req,res)=> {
  await dbConnect();
  const patch = await req.body;
  try {
    const updated = await Product.findByIdAndUpdate(params.id, patch, { new: true, runValidators: true });
    if (!updated) return res.json({ error: 'Not found' }, { status: 404 });
    return res.json(updated);
  } catch (e) {
    return res.json({ error: e.message }, { status: 400 });
  }
});

router.delete("/",async(req,res)=> {
  await dbConnect();
  const deleted = await Product.findByIdAndDelete(params.id);
  if (!deleted) return res.json({ error: 'Not found' }, { status: 404 });
  return res.json({ ok: true });
});

export default router;
