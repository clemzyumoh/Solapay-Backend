// Update user image


import User from "../models/User";
import { Request, Response } from "express";





export const updateProfileImage = async (req: Request, res:Response) => {
  const { userId, imageUrl } = req.body;

  if (!userId || !imageUrl) {
    return void res.status(400).json({ message: "Missing userId or imageUrl" });
  }

  try {
    // Update user's imageUrl in the DB
    const user = await User.findByIdAndUpdate(
      userId,
      { imageUrl },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return void res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user }); // respond with updated user
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getMe = async (req: Request, res: Response) => {
  
    const userId = req.user?._id;
    console.log("User from token:", req.user);

    if (!userId) {
      return void res.status(401).json({ message: "Unauthorized" });
    }
  
    const user = await User.findById(userId).select("-password");
    res.status(200).json({ user });
  };
  