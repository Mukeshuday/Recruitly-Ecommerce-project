import express from "express";
import { dbConnect } from '@/lib/db';
import Supplier from '@/lib/models/Supplier';

const router = express.Router();

router.use(async(req,res,next) =>{
  try{
    await dbConnect();
    next();
  }catch (err) {
    return res.status(500).json({error:"Database connection failed.."});
  }
});

router.get("/api/suppliers/[id]", async(req,res)=>{
  await dbConnect();
  try {
    const supplier = await Supplier.findById(params.id).lean();
    if (!supplier) return res.json({ error: 'Supplier not found' }, { status: 404 });
    return res.json(supplier);
  } catch (err) {
    return res.json({ error: err.message }, { status: 500 });
  }
});

router.get("/api/suppliers/[id]",async(req,res) =>{
await dbConnect();
  try {
    const body = await req.json();
    const updated = await Supplier.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.json({ error: 'Supplier not found' }, { status: 404 });
    return res.json(updated);
  } catch (err) {
    return res.json({ error: err.message }, { status: 400 });
  }
});

router.delete("/app-backend/api/stock-transactions/[id]",async(req,res) => 
{
  await dbConnect();
  try {
    const deleted = await Supplier.findByIdAndDelete(params.id);
    if (!deleted) return res.json({ error: 'Supplier not found' }, { status: 404 });
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ error: err.message }, { status: 500 });
  }
} );
