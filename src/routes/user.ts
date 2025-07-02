
import express from "express";
import { updateProfileImage , getMe} from "../controllers/userController";
import verifyToken from "../middlewares/authMiddleware";



const router = express.Router()
router.put("/profile/image", updateProfileImage);
router.get("/me", verifyToken, getMe); // 🧠 This is the missing route
router.get("/logout", (req, res) => {
  res.clearCookie("token", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  
  res.status(200).json({ message: "Logged out successfully" });
});
  

export default router