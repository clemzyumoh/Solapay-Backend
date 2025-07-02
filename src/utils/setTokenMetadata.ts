
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createMetadataAccountV3,
  findMetadataPda,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  signerIdentity,
  none,
  publicKey,
  createSignerFromKeypair,
} from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import dotenv from "dotenv";

dotenv.config();

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY!;
const MINT_ADDRESS = process.env.USDC_MINT_ADDRESS!;

export const setTokenMetadata = async () => {
  // Create UMI client
  const umi = createUmi("https://api.devnet.solana.com");

  // Convert web3 Keypair to UMI Signer
  const secretKey = bs58.decode(ADMIN_SECRET);
  const web3Keypair = Keypair.fromSecretKey(secretKey);
  const umiSigner = createSignerFromKeypair(
    umi,
    fromWeb3JsKeypair(web3Keypair)
  );

  // Use signer identity
  umi.use(signerIdentity(umiSigner));

  // Mint public key
  const mint = publicKey(MINT_ADDRESS);

  // Metadata PDA
  const metadata = findMetadataPda(umi, { mint });

  // Build and send transaction
  const tx = createMetadataAccountV3(umi, {
    metadata,
    mint,
    mintAuthority: umiSigner,
    payer: umiSigner,
    updateAuthority: umiSigner,
    data: {
      name: "USDC Devnet",
      symbol: "USDC",
      uri: "https://res.cloudinary.com/dwm4ss8cg/image/upload/v1750509912/1_ZQC-BEgk4qaWOZm6YcI0Iw_p7m9e5.png",
      sellerFeeBasisPoints: 0,
      creators: none(),
      collection: none(),
      uses: none(),
    },
    isMutable: true,
    collectionDetails: none(),
  });

  const result = await tx.sendAndConfirm(umi);
  console.log("✅ Metadata set! Signature:", result.signature);
  // console.log(
  //   "✅ Metadata set! Signature:",
  //   base58.serialize(result.signature)
  // );
 
  
};


// ✅ CALL the function here — OUTSIDE
setTokenMetadata().catch((err) => {
  console.error("❌ Failed to set metadata:", err);
});
