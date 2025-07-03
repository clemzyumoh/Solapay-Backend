

import nodemailer from "nodemailer";
 

// Create transporter (using Gmail SMTP in this example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your app password or SMTP key
  },
});

// Send notification email to a Solapay user
const sendUserNotificationEmail = async ({
  to,
  subject,
  message,
}: {
  to: string;
  subject: string;
  message: string;
}) => {
    try {
    const payUrl = "https://solapay-frontend.vercel.app";
      
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>${subject}</h2>
        <p>${message}</p>
        <p style="margin-top: 20px;">Visit your Solapay dashboard for details.</p>
        <div style="text-align: center; margin-top: 20px;">
    <a href="${payUrl}"
         style="display: inline-block; padding: 12px 24px; background-color: #14f195; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
         login solapay
      </a>
    </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Solapay" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📧 Notification email sent to:", to);
  } catch (error) {
    console.error("❌ Failed to send user notification email:", error);
  }
};

export default sendUserNotificationEmail;
