// utils/generateSolanaUrl.ts
import { encodeURL } from "@solana/pay";
import { PublicKey } from "@solana/web3.js";
import { BigNumber } from "bignumber.js";

// Utility to create a Solana Pay URL for QR code/payment
const generateSolanaUrl = ({
  recipient,
  amount,
  reference,
  // label,
  // message,
  memo,
}: {
  recipient: string; // wallet address to receive funds
  amount: number; // amount in SOL or USDC
  reference: string; // unique transaction reference
  // label?: string; // invoice label/title (optional)
  //   message?: string; // description (optional)
  memo?: string
}) => {
 try {
   // Construct the payment URL using Solana Pay SDK
   const url = encodeURL({
     recipient: new PublicKey(recipient), // convert string to PublicKey
     //amount, // transaction amount
     amount: new BigNumber(amount),
     reference: [new PublicKey(reference)], // reference must be array
    //  label, // optional
    //  message, // optional
     memo
   });

   // Return the URL as a string
   return url.toString();
 } catch (error) {
  throw new Error(
    "Invalid recipient or reference. Must be valid Solana addresses."
  );
 } 
};

export default generateSolanaUrl;
