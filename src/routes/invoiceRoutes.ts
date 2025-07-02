import express from "express";
import { createInvoice, updateInvoiceStatus, deleteInvoice, getInvoiceByIdOrReference, getUserInvoices } from "../controllers/invoiceController";

const router = express.Router()

router.post("/create", createInvoice)
router.get("/getall", getUserInvoices);
router.get("/getbyid", getInvoiceByIdOrReference);
router.patch("/updateinvoice", updateInvoiceStatus);
router.delete("/deleteinvoice", deleteInvoice);

export default router