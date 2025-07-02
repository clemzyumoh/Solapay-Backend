

import { Request, Response } from "express";
import { fundWallet } from "../utils/fundWallet";
import User from "../models/User";

export const handleFundRequest = async (req: Request, res: Response) => {
  const { walletAddress, userId } = req.body;

  if (!walletAddress || !userId) {
    return void res
      .status(400)
      .json({ error: "Wallet address and user ID are required" });
  }

  try {
    // ✅ Fetch user by ID
    const user = await User.findById(userId);
    if (!user) {
      return void res.status(404).json({ error: "User not found" });
    }

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (
      user.lastFundedAt &&
      now - new Date(user.lastFundedAt).getTime() < oneDay
    ) {
      return void res
        .status(429)
        .json({ error: "You can only fund once every 24 hours" });
    }

    // ✅ Fund wallet
    const result = await fundWallet(walletAddress);

    // ✅ Update timestamp
    user.lastFundedAt = new Date(now);
    await user.save();

    return void res
      .status(200)
      .json({ message: "Wallet funded successfully", ...result });
  } catch (error) {
    console.error("Funding error:", error);
    return void res.status(500).json({ error: "Failed to fund wallet" });
  }
};
