import express from "express";
import { dbConnect } from '../../lib/db.js';
import Supplier from '../../lib/models/Supplier.js';


const router = express.Router();

 router.get("/",async(req,res) =>
{
  await dbConnect();
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 }).lean();
    return res.json(suppliers);
  } catch (err) {
    return res.json({ error: err.message }, { status: 500 });
  }
});

router.post("/",async(req,res) =>
{
  await dbConnect();
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.email) {
      return res.json({ error: 'Name and Email are required' }, { status: 400 });
    }

    const newSupplier = await Supplier.create(body);
    return res.json(newSupplier, { status: 201 });
  } catch (err) {
    return res.json({ error: err.message }, { status: 400 });
  }
});


export default router;