
import express from "express";
import { Login, Register } from "../controllers/authController";

// Create a new router object
const router = express.Router();

// POST /register - handles user registration
router.post("/register",Register );
// POST /login - handles user login
router.post("/login", Login)





// Export the router so we can use it in index.ts
export default router;

