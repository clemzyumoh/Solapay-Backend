
import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();


// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    
    session: false,
   // successRedirect: "http://localhost:3000/", // Or your frontend
    failureRedirect: "http://localhost:3000/Login",
  }),
  (req, res) => {
    const user = req.user as any;
    // callback yrl http://localhost:5000/auth/google/callback

    const payload = {
      _id: user._id,
      email: user.email,
      name: user.name,
    };

    // Generate JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "5m",
    });
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });


    
    // Send user details to frontend
    res.redirect(
      `http://localhost:3000/`
        //`http://localhost:3000/auth-success?token=${token}&name=${user.name}&email=${user.email}&image=${user.image}`
    );

    //res.json({ token, message: "Google login successful" });
  }
);

// Discord OAuth
router.get("/discord", passport.authenticate("discord"));

router.get(
  "/discord/callback",
  passport.authenticate("discord", {
    session: false,
    //successRedirect: "http://localhost:3000/", // Or your frontend
    failureRedirect: "http://localhost:3000/Login",
  }),
  (req, res) => {
    const user = req.user as any;



    const payload = {
      _id: user._id,
      email: user.email,
      name: user.name,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "5m",
    });
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    // Send user details to frontend
    res.redirect(
      `http://localhost:3000/`
        //`http://localhost:3000/auth-success?token=${token}&name=${user.name}&email=${user.email}&image=${user.image}`
    );

    //Redirect URI: http://localhost:5000/auth/discord/callback
    //res.json({ token, message: "Discord login successful" });
  }
);

// Twitter (X) OAuth
// router.get("/twitter", passport.authenticate("twitter"));

// router.get("/twitter/callback", passport.authenticate("twitter", { session: false }), (req, res) => {
//   const user = req.user as any;
//   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "1d" });

//   res.json({ token, message: "Twitter login successful" });
// });

export default router;