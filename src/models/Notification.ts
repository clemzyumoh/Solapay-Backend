

// models/Notification.ts

import mongoose, { Schema, Document } from "mongoose"; // Import mongoose, Schema for defining structure, and Document for TS typing

// Define the TypeScript interface for a Notification document
export interface INotification extends Document {
  userId: string; // The ID of the user receiving the notification
  title: string; // Add this
  message: string; // The actual notification text (e.g., "Invoice INV-001 has been paid")
  type: "invoice" | "system"; // Type of notification (can be extended later)
  invoiceId?: string; // Optional: ID of the related invoice (if applicable)
  isRead: boolean; // To track if the user has read the notification
  createdAt: Date; // Auto-generated timestamp for creation
  senderImageUrl: string;
  receiverImageUrl: string;
  fromEmail: string; // 🔥 New - who sent the invoice
  toEmail: string; // 🔥 New - who received the invoice
}

// Define the Mongoose schema for the Notification model
const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: String, // User ID is a string (can also be ObjectId if your User model uses that)
      required: true, // Every notification must belong to a user
    },
    title: { type: String, required: true }, // New field
    message: {
      type: String, // Message body of the notification
      required: true, // Cannot be empty
    },

    senderImageUrl: {
      type: String, // Field type
      default: "",
    },
    receiverImageUrl: {
      type: String, // Field type
      default: "",
    },
    fromEmail: { type: String, required: true }, // 🆕
    toEmail: { type: String, required: true }, // 🆕
    type: {
      type: String,
      enum: ["invoice-created", "invoice-paid"],
      default: "invoice-created",
    }
,    

    invoiceId: {
      type: String, // Optional field to link this notification to a specific invoice
    },
    isRead: {
      type: Boolean, // Tracks if the user has opened/read it
      default: false, // By default, it's unread
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Export the model using mongoose.model()
export default mongoose.model<INotification>("Notification", NotificationSchema);
