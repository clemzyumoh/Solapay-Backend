
  
// src/utils/fundWallet.ts

// 🔗 Import necessary Solana Web3.js and SPL Token utilities
import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    Keypair,
    clusterApiUrl,
  } from '@solana/web3.js';
  
  import {
    getOrCreateAssociatedTokenAccount,
    mintTo,
  } from '@solana/spl-token';
  
  import bs58 from 'bs58'; // For decoding base58 private key
  import dotenv from 'dotenv'; // For loading .env config
  
  dotenv.config(); // Load environment variables
  
  // 🔐 Load your admin wallet's secret key (Base58-encoded in .env file)
  const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY as string;
  const admin = Keypair.fromSecretKey(bs58.decode(ADMIN_SECRET)); // Decode and create Keypair from secret
  
  // 🌐 Create a connection to Solana Devnet
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  
  // 💵 Load your custom USDC mint address from .env
  const USDC_MINT = new PublicKey(process.env.USDC_MINT_ADDRESS as string);
  
  /**
   * 🔧 Fund a user wallet with 1 SOL + 100 USDC on Devnet
   * @param userWalletAddress The user's wallet public key as a string
   */
  export const fundWallet = async (userWalletAddress: string): Promise<{ success: boolean }> => {
    const userPubkey = new PublicKey(userWalletAddress); // Convert to PublicKey object
  
    // ✅ 1. Airdrop 1 SOL to the user
     const sig = await connection.requestAirdrop(userPubkey, LAMPORTS_PER_SOL); // Request 1 SOL
     await connection.confirmTransaction(sig, 'confirmed'); // Wait for confirmation
  
    // ✅ 2. Create or fetch the user's USDC associated token account (ATA)
    const userATA = await getOrCreateAssociatedTokenAccount(
      connection,
      admin,        // Fee payer (admin)
      USDC_MINT,    // Mint address of USDC
      userPubkey    // Wallet address that will own the USDC
    );
  
    // ✅ 3. Mint 100 USDC (6 decimals = 100_000_000)
    await mintTo(
      connection,
      admin,               // Fee payer
      USDC_MINT,           // USDC mint address
      userATA.address,     // Destination token account
      admin,               // Mint authority (admin keypair)
      100_000_000          // Amount to mint (100 USDC)
    );
  
    return { success: true }; // Return success to the controller
  };
  