
import express from "express" //This imports Express, the framework that helps us build APIs (routes, middleware)
//import is the modern way instead of const express = require('express');.
import dotenv from "dotenv" //Loads environment variables from .env file (like DB password, port, secret keys).
import cors from "cors"  // cors is middleware that allows your frontend (like a React app) to talk to the backend safely.
import connectDB from "../src/config/db";
import authRoutes from "./routes/auth";
import socialRoutes from "./routes/socialAuth"
import invoiceRoutes from "./routes/invoiceRoutes"
import userRoutes from "./routes/user"
import passport from "./config/passport"; // Import strategy definitions
import cookieParser from "cookie-parser";
import "../src/utils/paymentTracker"

import fundRoutes from "./routes/fundRoute"
import notificationRoutes from "./routes/notificationRoutes"

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      _id: string; // or _id: string if you use _id
      // add other properties you store in token if needed
      email: string;
    };
  }
}

// declare global {
//   namespace Express {
//     interface Request {
//       User?: {
//         userId: string;
//         email: string;
//         name: string;
//         iat?: number;
//         exp?: number;
//       };
//     }
//   }
// }



//import session from "express-session"; // (Optional, needed if using session login)

dotenv.config() // cors is middleware that allows your frontend (like a React app) to talk to the backend safely.
const app = express() // Creates an Express app instance, which represents your whole backend API
const PORT = process.env.PORT || 5000;

// Connect to DB
connectDB();

// Middlewares

app.use(express.json()); // Parse JSON body,Tells Express to automatically parse JSON bodies in incoming requests (POST, PUT, etc).You don’t have to manually parse req.body
//app.use(cors()); // Allow frontend to access
// app.ts or index.ts

app.use(cookieParser());

// app.use(
//   cors({
//     origin: "http://localhost:3000", // ✅ frontend origin 
//     credentials: true, // ✅ allow cookies
//   })
// );
app.use(
  cors({
    origin: ["http://localhost:3000", "https://solapay-frontend.vercel.app"],
    credentials: true, // if you're using cookies
  })
);


app.use(passport.initialize()); // Initialize passport for auth
//app.use(cookieParser());



//Routes
app.use("/auth", authRoutes); // Register and login
app.use("/auth", socialRoutes); // Google, Discord, etc.
app.use("/auth", userRoutes); // user profile
app.use("/invoice", invoiceRoutes)
// Register fund route
app.use('/solapay', fundRoutes);
app.use("/notify", notificationRoutes)


// Basic route
app.get("/", (_req, res) => {
  res.send("Welcome to Solapay API 🚀");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}); //Starts the server and listens for requests on the given port.The callback () => {...} runs once the server starts.console.log helps us know the backend is running.