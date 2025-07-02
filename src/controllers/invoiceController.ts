// controllers/invoiceController.ts
import { Request, Response } from "express";
import Invoice from "../models/Invoice"; // import invoice model
import User from "../models/User"; // for checking if receiver exists
import { v4 as uuidv4 } from "uuid"; // for generating invoiceId and reference
import generateSolanaUrl from "../utils/generateSolanaUrl"; // function to generate Solana Pay URL
import generateQRCode from "../utils/generateQRcode"; // function to create QR from Solana Pay URL
import sendInvoiceEmail from "../utils/sendInvoiceEmail"; // email function
import { Keypair } from "@solana/web3.js";
import { notifyInvoiceCreated, notifyInvoicePaid } from "../utils/notificationService";

// Controller to create a new invoice
export const createInvoice = async (req: Request, res: Response) => {
  try {
    // 1. Get invoice data from request body
    const {
      title,
      description,
      amount,
      token,
      fromName,
      fromAddress,
      fromEmail,
      //fromUserId,
      toName,
      toemail,
      dueDate,
    } = req.body;

    // 2. Validate required fields (basic check)
    if (!title || !amount || !token || !fromAddress || !toemail) {
      return void res.status(400).json({ message: "Missing required fields." });
    }

    // 3. Generate unique invoiceId and reference
    const invoiceId = uuidv4(); // Universally unique ID
    //const reference = uuidv4(); // Another unique ID used in Solana Pay tracking

    const reference = Keypair.generate().publicKey.toBase58(); // ✅ Generate valid reference
    // 4. Create Solana Pay URL
    const solanaUrl = generateSolanaUrl({
      recipient: fromAddress,
      amount,
      reference,
      // label: title,
      // message: description,
      memo: `solapay-${invoiceId}`,
    });

    // 5. Generate QR code image URL from Solana URL
    const qrCodeUrl = await generateQRCode(solanaUrl); // base64 or hosted link

    // 6. Check if receiver is a registered Solapay user
    const receiverExists = await User.findOne({ email: toemail });

    // 7. Create the invoice in the DB
    const newInvoice = await Invoice.create({
      invoiceId,
      title,
      description,
      amount,
      token,
      fromName,
      fromAddress,
      fromEmail,
      //fromUserId,
      toName,
      toemail,
      dueDate,
      reference,
      solanaUrl,
      qrCodeUrl,
      status: "pending",
    });

   // 8. If receiver doesn't exist, send email with invoice details
    if (!receiverExists) {
      await sendInvoiceEmail({
        to: toemail,
        subject: `Invoice from ${fromName}`,
        invoice: newInvoice,
      });
    }

    
    try {
    await notifyInvoiceCreated(newInvoice);
      
    } catch (e) {
      console.warn("Notification failed:", e);
    }
    

    // 9. Respond with created invoice
    return void res.status(201).json({
      message: "Invoice created successfully",
      invoice: newInvoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return void res.status(500).json({ message: "Server error" });
  }
};

 

// Function to get invoices related to the logged-in user (sender or receiver)
export const getUserInvoices = async (req: Request, res: Response) => {
  try {
    // Extract the email of the current user from query or request (frontend should send this)
    //const userEmail = req.user?.email;
    const userEmail = req.query.email as string; // Expecting ?email=... in query

    //Only send email in query if fetching public/shared invoice info, not private dashboard data.

    // If no email provided, return an error
    if (!userEmail) {
      return void res.status(400).json({ message: "Email is required" });
    }

    // Fetch all invoices where the user is either sender or receiver
    const invoices = await Invoice.find({
      $or: [
        { fromEmail: userEmail }, // Invoices created by the user
        { toemail: userEmail }, // Invoices received by the user
      ],
    }).sort({ createdAt: -1 }); // Sort by most recent

    // Return the invoices to frontend
    res.status(200).json(invoices);
  } catch (error) {
    // If something goes wrong, return an error response
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
};




// Controller function to fetch invoice by either invoiceId or reference
export const getInvoiceByIdOrReference = async (req: Request, res: Response) => {
  try {
    // Extract query parameters from URL, either invoiceId or reference
    const { invoiceId, reference } = req.query;

    // Check if neither is provided – return error
    if (!invoiceId && !reference) {
      return void res.status(400).json({ message: "Missing invoiceId or reference." });
    }

    // Find the invoice using invoiceId or reference
    const invoice = await Invoice.findOne({
      $or: [
        { invoiceId: invoiceId as string },
        { reference: reference as string },
      ],
    });

    // If no invoice found, return 404
    if (!invoice) {
      return void res.status(404).json({ message: "Invoice not found." });
    }

    // If invoice found, return it
    return void res.status(200).json(invoice);

  } catch (error) {
    // Catch and return any server errors
    console.error("Error fetching invoice:", error);
    return void res.status(500).json({ message: "Server error." });
  }
};



import { Connection, PublicKey, TransactionResponse } from "@solana/web3.js";


// Solana devnet connection
const connection = new Connection(
  "https://soft-polished-research.solana-devnet.quiknode.pro/01341c073fd33b187d569afa84ffffddd21b9e13/"
);



export const updateInvoiceStatus = async (req: Request, res: Response) => {
  try {
    const rawSignature = req.query.signature;

    //const { signature } = req.query;

    if (
      !rawSignature ||
      Array.isArray(rawSignature) ||
      typeof rawSignature !== "string"
    ) {
      return void res
        .status(400)
        .json({ error: "Missing or invalid signature" });
    }

    const signature = rawSignature;
console.log("Checking tx signature:", signature);

    // const tx = await connection.getTransaction(signature, {
    //   commitment: "confirmed",

    //  // maxSupportedTransactionVersion: 0, // legacy format
    // });
    const tx = await connection.getParsedTransaction(signature, {
      commitment: "confirmed",
    });
    

    if (!tx) {
      return void res
        .status(400)
        .json({ error: "Transaction not found or not confirmed" });
    }

    // const instructions = tx.transaction.message.instructions ?? [];
    // let invoiceIdFromMemo = "";

    // for (const ix of instructions) {
    //   const programId =
    //     tx.transaction.message.accountKeys[ix.programIdIndex].toString();

    //   if (programId === "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr") {
    //     //const memo = Buffer.from(ix.data, "base64").toString("utf-8");
    //     const memo = ix.data?.toString().trim();
    //     if (memo && memo.includes("-")) {
    //       // UUID check
    //       invoiceIdFromMemo = memo;
    //       break;
    //     }
    //     // const memo = ix.data; // ✅ Already UTF-8 string
    //     // invoiceIdFromMemo = memo.trim(); // just in case of whitespace
    //     //invoiceIdFromMemo = memo;
    // console.log("memo", memo);

        
    //   }
    // }
    const instructions = tx?.transaction?.message?.instructions ?? [];
    let invoiceIdFromMemo = "";

    for (const ix of instructions) {
      if (
        "parsed" in ix &&
        ix.program === "spl-memo" &&
        typeof ix.parsed === "string"
      ) {
        if (ix.parsed.includes("-")) {
          // crude UUID check
          invoiceIdFromMemo = ix.parsed.trim();
          break;
        }
      }
    }


    if (!invoiceIdFromMemo) {
      return void res
        .status(400)
        .json({ error: "Invoice ID (memo) not found in transaction" });
    }

    // Fetch invoice from DB using memo (invoiceId)
    const invoice = await Invoice.findOne({ invoiceId: invoiceIdFromMemo });
    console.log("memoid", invoiceIdFromMemo);
    console.log("invoiceid", invoice?.invoiceId);
    

    if (!invoice) {
      return void res.status(404).json({ error: "Invoice not found" });
    }

    // If already paid
    if (invoice.status === "paid") {
      return void res
        .status(200)
        .json({ message: "Invoice already paid", invoice });
    }

    // Expire if due date has passed
    if (
      invoice.status === "pending" &&
      invoice.dueDate &&
      new Date() > invoice.dueDate
    ) {
      invoice.status = "expired";
      await invoice.save();
      return void res.status(200).json({ message: "Invoice expired", invoice });
    }

    // Optional: validate recipient, token, amount, etc. here

    // All good, mark as paid
    invoice.status = "paid";
    invoice.paidAt = new Date();
    invoice.signature = signature;
    await invoice.save();

    try {
      await notifyInvoicePaid(invoice);
    } catch (e) {
      console.warn("Notification failed:", e);
    }

    return void res
      .status(200)
      .json({ message: "Invoice marked as paid", invoice });
  } catch (error) {
    console.error("Error tracking payment:", error);
    return void res.status(500).json({ error: "Server error" });
  }
};


export const deleteInvoice = async (req: Request, res: Response) => {
    try {
      // Extract invoiceId or reference from request params or query
      const { invoiceId, reference } = req.query;
  
      // Validate at least one identifier is provided
      if (!invoiceId && !reference) {
        return void res.status(400).json({ error: "Missing invoiceId or reference" });
      }
  
      // Find the invoice by invoiceId or reference
      const invoice = await Invoice.findOne(
        invoiceId ? { invoiceId } : { reference }
      );
  
      // If invoice not found, return 404
      if (!invoice) {
        return void res.status(404).json({ error: "Invoice not found" });
      }
  
      // Only allow deleting if invoice is still pending
      if (invoice.status !== "pending") {
        return void res
          .status(400)
          .json({ error: "Only pending invoices can be deleted" });
      }
  
      // Delete the invoice document
      await invoice.deleteOne();
  
      // Return success response
      return void res.status(200).json({ message: "Invoice deleted successfully" });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      return void res.status(500).json({ error: "Server error deleting invoice" });
    }
  };
  