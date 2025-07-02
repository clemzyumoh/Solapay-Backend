

// scripts/convertToBase58.ts

import bs58 from 'bs58';
import fs from 'fs';

// Load your keypair JSON file (exported from Phantom or solana-keygen)
const keypairPath = 'admin.json'; // Put this file in your root directory
const raw = fs.readFileSync(keypairPath, 'utf8');

// Parse to Uint8Array
const secretKey = Uint8Array.from(JSON.parse(raw));

// Convert to base58 string
const base58Secret = bs58.encode(secretKey);

// Print it so you can copy to .env
console.log('Base58 Secret Key:', base58Secret);
