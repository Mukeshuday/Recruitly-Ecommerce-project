import express from "express";
import { dbConnect } from '../../../lib/db.js';
import Supplier from '../../../lib/models/Supplier.js';

const router = express.Router();


router.get("/", async(req,res)=>{
  try {
    await dbConnect();
    const supplier = await Supplier.findById(params.id).lean();
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    return res.json(supplier);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.put("/",async(req,res) =>{
  try {
    await dbConnect();
    const updated = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'Supplier not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete("/",async(req,res) => 
{
  try {
    await dbConnect();
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Supplier not found' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
} );


export default router;