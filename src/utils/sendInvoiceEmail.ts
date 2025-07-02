// utils/sendInvoiceEmail.ts
import nodemailer from "nodemailer";
import { IInvoice } from "../models/Invoice"; // for type

// Configure Nodemailer transporter (e.g., using Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail", // or Mailgun/Sendgrid in production
  auth: {
    user: process.env.EMAIL_USER, // your email address (env)
    pass: process.env.EMAIL_PASS, // app password or SMTP password
  },
});

// Sends invoice email to non-Solapay users
const sendInvoiceEmail = async ({
  to,
  subject,
  invoice,
}: {
  to: string; // receiver email
  subject: string; // email subject
  invoice: IInvoice; // invoice object
}) => {
  try {
    // Compose HTML email content
   
    //const payUrl = encodeURI(invoice.solanaUrl);
    //const payUrl = invoice.solanaUrl; // don't encode
   // const payUrl = `http://localhost:3000/Public-Pay?invoiceId=${invoice.invoiceId}&reference=${invoice.reference}`;
    const payUrl = `http://localhost:3000/Public-Pay?invoiceId=${invoice.invoiceId}`


    const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2>You’ve received an invoice</h2>
    <p><strong>From:</strong> ${invoice.fromName} (${invoice.fromEmail})</p>
    <p><strong>Title:</strong> ${invoice.title}</p>
    <p><strong>Description:</strong> ${invoice.description}</p>
    <p><strong>Amount:</strong> ${invoice.amount} ${invoice.token}</p>


     <div style="text-align: center; margin-top: 20px;">
      <img src="cid:qrcode" alt="Scan to Pay" style="width:200px;" />
    </div>

    <p><strong>Address:</strong> ${invoice.fromAddress}</p>

   

    <div style="text-align: center; margin-top: 20px;">
    <a href="${payUrl}"
         style="display: inline-block; padding: 12px 24px; background-color: #14f195; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
         Pay Now
      </a>
    </div>

    <p><strong>Due date:</strong> ${invoice.dueDate}</p>

  </div>
`;

    await transporter.sendMail({
      from: `"Solapay" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments: [
        {
          filename: "qrcode.png",
          content: invoice.qrCodeUrl.split("base64,")[1],
          encoding: "base64",
          cid: "qrcode",
        },
      ],
    });

    console.log("Invoice email sent to:", to);
  } catch (error) {
    console.error("Failed to send invoice email:", error);
  }
};

export default sendInvoiceEmail;

// <img src="${invoice.qrCodeUrl}" alt="Scan to Pay" style="width:200px;margin-top:10px;" />
// Nodemailer is a Node.js module that allows your backend to send emails using an SMTP server (like Gmail, Outlook, etc.).

// 🔧 Use Cases:
// Send password reset links

// Send invoices (like in Solapay)

// Send OTPs or verification codes

// Notify users(e.g., "Payment successful!")

// A transporter is the object that connects your app to the email server.

// It holds the config for:

// The email service you're using (e.g., Gmail, Outlook, etc.)

// Your email login (email + password)

// SMTP server is the email server(like Gmail's) that
//     sends emails on your behalf using a protocol called SMTP(Simple Mail Transfer Protocol).

// ✅ Yes — EMAIL_USER is your personal or business email,
// and EMAIL_PASS is an App Password (not your real password).

// 🔐 For Gmail, enable 2FA and generate an App Password at https://myaccount.google.com/apppasswords
// Use that as EMAIL_PASS.
