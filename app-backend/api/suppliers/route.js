import express from "express";
import { dbConnect } from '../../lib/db.js';
import Supplier from '../../lib/models/Supplier.js';


const router = express.Router();

 router.get("/",async(req,res) =>
{
  await dbConnect();
  try {
    await dbConnect();
    const suppliers = await Supplier.find().sort({ createdAt: -1 }).lean();
    return res.json(suppliers);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/",async(req,res) =>
{
  try {
    await dbConnect();
    const body =  req.body;
    // Validate required fields
    if (!body.name || !body.email) {
      return res.status(400).json({ error: "Name and Email are required" });
    }

    const newSupplier = await Supplier.create(body);
    return res.status(201).json(newSupplier);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});


export default router;