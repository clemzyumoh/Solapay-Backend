// utils/generateQRCode.ts
import QRCode from "qrcode";

// Generates a base64 QR code from a given URL
const generateQRCode = async (url: string): Promise<string> => {
  try {
    // Use qrcode package to generate a data URL (base64 image)
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "H", // high error correction
      margin: 2, // some margin
      width: 300, // image size
    });

    // Return the base64 data
    return qrCodeDataUrl;
  } catch (error) {
    console.error("QR Code generation error:", error);
    throw new Error("Failed to generate QR code");
  }
};

export default generateQRCode;
