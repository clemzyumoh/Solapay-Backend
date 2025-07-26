
import {  Request, Response } from "express"; // Express for routing

import bcrypt from "bcrypt"; // For securely hashing passwords
import User from "../models/User"; // Import the User model
import Jwt  from "jsonwebtoken";// 🔐 Add this at the top with other imports

export const Register = async (req: Request, res: Response) => {
  try {
    console.log("REQ BODY:", req.body); // ✅ Check incoming data
    // Destructure name, email, and password from request body
    const { name, email, password } = req.body;

    // Input validation: check if any field is missing
    if (!name || !email || !password) {
      return void res.status(400).json({ message: "All Fields are Required" });
    }

    // Check if user already exists in the database
    const extingUser = await User.findOne({ email });
    if (extingUser) {
      return void res
        .status(409)
        .json({ message: "User already exists with this email." });
    }
   
    // Hash the password securely with bcrypt
    const salt = await bcrypt.genSalt(10); // Generate salt (random bits)
    const hashedPassword = await bcrypt.hash(password, salt); // Hash password with salt

    // Create a new user object
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save the new user to MongoDB
    await newUser.save();

    // Create JWT payload — minimal info, usually user ID or email
    const payload = {
      userId: newUser._id,
      email: newUser.email,
      name: newUser.name,
    };
   

    // Sign the JWT token, secret comes from .env file (must be set!)
    const token = Jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "1d", // token expires in 1 hour
    });

    // Set cookie
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: true, // // Set to true in production (HTTPS)
    //   sameSite: "none", // Set to strict in production (HTTPS)
    //   maxAge: 2 * 24 * 60 * 60 * 1000, // 1min
    // });
    //const isProduction = process.env.NODE_ENV === "production";
    const isProduction = process.env.IS_PROD === "true" || false;

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: "/",
    });

      
      
    // Remove password from user object before sending response
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      // do NOT send password hash
    };

    // Send back success message, user info and token
    return void res.status(201).json({
      message: "User registered successfully ✅",
      token,
      user: userResponse,
    });
  } catch (error) {
    // Catch any server errors and return generic error response
    console.log("Registration Error", error);
   return void res.status(500).json({ message: "Server error during registration." });

    
  }
}

export const Login = async (req: Request, res: Response) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;
    // Check if fields are missing
    if (!email || !password) {
      return void res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return void res.status(404).json({ message: "User not Found" });
    }

    // Compare the provided password with the hashed one in the DB
    const isMarch = await bcrypt.compare(password, user.password);
    if (!isMarch) {
      return void res
        .status(401)
        .json({ message: "invalid password or email" });
    }

    // Create JWT payload
   
    //   // Sign token with secret key and expiration time
    //   const token = Jwt.sign(payload, process.env.JWT_SECRET as string, {
    //     expiresIn: "7d", // token is valid for 7 days
    //   });
    const payload = {
      _id: user._id,
      email: user.email,
      name: user.name,
    };
    // 5. Create JWT token
    const token = Jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });
    // // Set cookie
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: true, // Set to true in production (HTTPS)
    //   sameSite: "none", // Set to strict in production (HTTPS)
    //   maxAge: 2 * 24 * 60 * 60 * 1000,
    // });
   // const isProduction = process.env.NODE_ENV === "production";
    const isProduction = process.env.IS_PROD === "true" || false;

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: "/",
    });
    
    // If everything is okay, return success
    return void res.status(200).json({
      message: "Login successful",
      token, // send token to client
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return void res.status(500).json({ message: "Server error during login." });
  }
};


// - if (error) return res.status(400).json({ message: error });
// + if (error) { res.status(400).json({ message: error }); return; }
// # or
// + if (error) return void res.status(400).json({ message: error });
// returning Response did work with @types/express@4, because there was only void return type, and it was technically compatible with returning anything (it just used to ignore that discrepancy). But that ignorance no longer happen with return type void | Promise<void>.

// In your case the statement return res.json() does two things:

// sends the response
// but also returns the response from the function (which is not needed, means nothing and causing the issue)
// Therefore, you need either to separate sending from returning (make it two statements) or suppress returning (by using the void keyword).

// That's how you migrate to @types/express@5.0.0.