
import Notification from "../models/Notification"; // Import Notification model
import User from "../models/User"; // Import User model to check if receiver is a Solapay user
import sendUserNotificationEmail from "../utils/sendUserNotificationEmail";

export const notifyInvoiceCreated = async (invoice: any) => {
  // 1. Get both sender and receiver data
  const recipientUser = await User.findOne({ email: invoice.toemail });
  const senderUser = await User.findOne({ email: invoice.fromEmail });

  // 2. Create base notification object
  const baseNotification = {
    invoiceId: invoice._id,
    type: "invoice-created",
    read: false,
    senderImageUrl: senderUser?.imageUrl || "",
    receiverImageUrl: recipientUser?.imageUrl || "",
    fromEmail: invoice.fromEmail, // ✅ new
    toEmail: invoice.toemail, // ✅ new
  };

  // 3. Notification array
  const notifications = [];

  // 4. Always notify the sender
  notifications.push({
    ...baseNotification,
    userId: invoice.fromEmail, // email is now used instead of Mongo userId
    title: "Invoice Sent", // Add this
    message: recipientUser
      ? `User ${invoice.toName} has received your invoice "${invoice.title}".`
      : `Invoice sent via email to  ${invoice.toemail}.`,
  });

  // 5. Notify the receiver **only if they’re a Solapay user**
  if (recipientUser) {
    notifications.push({
      ...baseNotification,
      userId: invoice.toemail, // also using email
      title: "New Invoice Received", // Add this
      message: `You have received a new invoice "${invoice.title}" from ${invoice.fromName}.`,
    });
  }

  // 6. Save all notifications
  await Notification.insertMany(notifications);

  //7.notify via email
  
  if (recipientUser) {
    await sendUserNotificationEmail({
      to: invoice.toemail,
      subject: "You've received a new invoice on Solapay",
      message: `You received an invoice titled "${invoice.title}" from ${invoice.fromName}.`,
    });

    await sendUserNotificationEmail({
      to: invoice.fromEmail,
      subject: "Invoice sent successfully",
      message: `Your invoice "${invoice.title}" was sent to ${invoice.toName}.`,
    });
  }
};
  



// Function to notify both parties when an invoice is marked as paid
export const notifyInvoicePaid = async (invoice: any) => {
    // 1. Find sender and receiver users by email
    const senderUser = await User.findOne({ email: invoice.fromEmail });
    const receiverUser = await User.findOne({ email: invoice.toemail });
  
    // 2. Create shared notification data
    const baseNotification = {
      invoiceId: invoice._id, // Link to invoice
      type: "invoice-paid", // Type of notification
      read: false, // Unread by default
      senderImageUrl: senderUser?.imageUrl || "", // Sender’s image
      receiverImageUrl: receiverUser?.imageUrl || "", // Receiver’s image
      fromEmail: invoice.fromEmail, // ✅ new
      toEmail: invoice.toemail, // ✅ new
    };
  
    // 3. Build the two different notifications for sender and receiver
    const notifications = [
      {
        ...baseNotification,
        userId: invoice.fromEmail, // Sender gets notified using their email
        title: "Invoice Paid", // Add this
        message: `Your invoice "${invoice.title}" has been paid by ${invoice.toName}.`,
      },
      {
        ...baseNotification,
        userId: invoice.toemail, // Receiver gets notified using their email
        title: "Payment Successful", // Add this
        message: `You have successfully paid the invoice "${invoice.title}".`,
      },
    ];
  
    // 4. Save both notifications to DB
    await Notification.insertMany(notifications);

    //5 notify user
    await sendUserNotificationEmail({
      to: invoice.fromEmail,
      subject: "Invoice Paid",
      message: `Your invoice titled "${invoice.title}" has been paid by ${invoice.toName}.`,
    });

    await sendUserNotificationEmail({
      to: invoice.toemail,
      subject: "You Paid an Invoice",
      message: `You have successfully paid the invoice titled "${invoice.title}".`,
    });
      
  };
  