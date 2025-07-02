import mongoose, { Document, Schema } from "mongoose";


export interface IInvoice extends Document {
  invoiceId: string; // Unique ID (UUID or timestamp-based)
  title: string; // Invoice title (e.g., "Payment for Service")
  description: string; // Optional description
  amount: number; // Amount in SOL (not lamports)
  token: "SOL" | "USDC"; // Currency type
  fromName: string; // Sender name
  fromAddress: string; // Solana wallet address (publicKey)
  fromEmail: string;
  toName: string; // Receiver name (optional)
  //toAddress: string; // Solana wallet address (publicKey)
  toemail: string; // Receiver email (to send invoice)
  status: "pending" | "paid" | "expired"; // Payment status
  createdAt: Date;
  dueDate: Date; // Optional due date
  paidAt?: Date; // Filled when paid
  qrCodeUrl: string; // A URL to a QR code image (optional: base64 or remote)
  solanaUrl: string; // The Solana Pay URL (used to generate QR)
  reference: string;
  signature: string;
  //fromUserId: string
}


const InvoiceSchema: Schema = new Schema<IInvoice>({
  invoiceId: {
    type: String, // Field type
    required: false,
    trim: true,
  },
  // fromUserId: {
  //   type: String, // or Schema.Types.ObjectId if you use Mongoose ObjectIds
  //   required: true,
  // },

  title: {
    type: String, // Field type
    required: true, // Field must be present
    trim: true,
  },
  description: {
    type: String, // Field type
    required: true, // Field must be present
    trim: true,
  },
  amount: {
    type: Number, // Field type
    required: true, // Field must be present
    //trim: true,
  },
  token: {
    type: String, // Field type
    required: true, // Field must be present
    trim: true,
  },
  fromName: {
    type: String, // Field type
    required: false, // Field must be present
    trim: true,
  },
  fromAddress: {
    type: String, // Field type
    required: false, // Field must be present
    trim: true,
  },
  fromEmail: {
    type: String, // Field type
    required: false, // Field must be present
    trim: true,
    lowercase: true,
  },
  toName: {
    type: String, // Field type
    required: true, // Field must be present
    trim: true,
  },
  toemail: {
    type: String, // Field type
    required: true, // Field must be present
    trim: true,
    lowercase: true,
  },
  status: {
    type: String, // Optional: used if user logs in via Google, Discord, etc.
    default: "pending",
    required: true,
    enum: ["pending", "paid", "expired"],
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to current date/time
  },
  dueDate: { type: Date },
  paidAt: { type: Date },
  reference: {
    type: String,
    required: false,
    trim: true,
  },
  signature: {
    type: String,
    required: false,
    trim: true,
  },
  solanaUrl: {
    type: String,
    required: false,
    trim: true,
  },
  qrCodeUrl: {
    type: String,
    required: false,
    trim: true,
  },
});

export default mongoose.model<IInvoice>("Invoice" , InvoiceSchema)