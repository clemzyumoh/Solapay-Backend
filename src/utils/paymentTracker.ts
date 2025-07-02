import { Connection, PublicKey } from "@solana/web3.js";
import Invoice from "../models/Invoice";
import { notifyInvoicePaid } from "./notificationService";
// This function runs in the background and updates all pending invoices if paid
export const trackPendingInvoices = async () => {
  const connection = new Connection(
    "https://fragrant-distinguished-breeze.solana-devnet.quiknode.pro/3f1348ab9333263e144b21c1910d1eaac269e576/"
  );

  // Get all invoices that are still pending
  const pendingInvoices = await Invoice.find({ status: "pending" }).limit(2);

  for (const invoice of pendingInvoices) {
    await new Promise((res) => setTimeout(res, 800)); // just delay
    //await new Promise((res) => setTimeout(res, 300)); // delay between each check
    try {
      // const referencePublicKey = new PublicKey(invoice.reference);
      const recipientPublicKey = new PublicKey(invoice.fromAddress);
      const signatures = await connection.getSignaturesForAddress(
        recipientPublicKey,
        { limit: 5 }
      );

      // const signatures = await connection.getSignaturesForAddress(
      //   referencePublicKey,
      //   { limit: 5 }
      // );

      if (signatures.length === 0) continue;
console.log("sig.length", signatures.length)
      const parsedTxs = await connection.getParsedTransactions(
        signatures.map((sig) => sig.signature)
      );

      for (const tx of parsedTxs) {
        if (!tx) continue;

        const message = tx.transaction.message;

        const hasMatchingMemo = message.instructions.some((ix) => {
          return (
            "parsed" in ix &&
            ix.program === "spl-memo" &&
            ix.parsed === invoice.invoiceId
          );
        });
        console.log("memo", hasMatchingMemo);

        if (!hasMatchingMemo) continue;

    
        if (["pending", "expired"].includes(invoice.status)) {
          invoice.status = "paid";
          invoice.paidAt = new Date();
          invoice.signature = tx.transaction.signatures[0];

          await invoice.save();
          await notifyInvoicePaid(invoice);
          console.log(`✅ Invoice ${invoice._id} marked as paid (via tracker)`);
        }
        

        break;
      }

   
    } catch (error) {
      console.error(`❌ Error checking invoice ${invoice._id}:`, error);
    }
  }
};

//import { trackPendingInvoices } from "./paymentTracker";

// Run every 5 seconds
setInterval(async () => {
  console.log("🔁 Checking for invoice payments...");
  try {
    await trackPendingInvoices();
  } catch (error) {
    console.error("❌ Error checking payments:", error);
  }
}, 300000);
