// Passport.js is middleware for Express that simplifies authentication. It supports various providers like Google, Discord, Twitter (X), etc.

// What is serializeUser & deserializeUser?
// These are used only if you're using sessions (like cookies) to store login state between requests.

// But you already use JWT (verifyToken), which is stateless. So, you do not need serializeUser and deserializeUser unless you're using session-based login.
// passport.serializeUser((user: any, done) => {
//   done(null, user.id);
// });
// passport.deserializeUser(async (id, done) => {
//   const user = await User.findById(id);
//   done(null, user);
//});

// Telegram (doesn’t use passport strategy directly)
// Uses Telegram Login Widget

// You’ll receive user info in query params — we’ll validate it with a secret key.
  
import passport from "passport";
//import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {
  Strategy as DiscordStrategy,
  Profile as DiscordProfile} from "passport-discord";
//import { Strategy as TwitterStrategy } from "passport-twitter";
import User from "../models/User";
//import { Strategy as TelegramStrategy} from "passport-telegram-official"
import dotenv from "dotenv"
//import { profile } from "console";
import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile
} from "passport-google-oauth20";
import { VerifyCallback } from "passport-oauth2";

dotenv.config() //Load .env file to access credentials

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
       //callbackURL: "http://localhost:5000/auth/google/callback",
    callbackURL: "https://solapay-backend.onrender.com/auth/google/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GoogleProfile,
      done: VerifyCallback
    ) => {
      try {
        // Check if user already exists
        let existingUser = await User.findOne({ discordId: profile.id });

        if (!existingUser) {
          existingUser = await User.findOne({
            email: profile.emails?.[0]?.value,
          }); // ✅
        }

        if (existingUser) return done(null, existingUser);

        // If user does not exist, create new user in DB
        const newUser = new User({
          googleId: profile.id, // Save Google profile ID to identify OAuth users
          provider: "google", // Mark provider as "google"
          name: profile.displayName, // User's display name from Google
          email: profile.emails?.[0]?.value, // User's email from Google (optional chaining for safety)
          imageUrl: profile.photos?.[0]?.value, // User's profile image from Google
          // Note: no password needed for OAuth users
        });

        // Save new user to database
        await newUser.save();
        return done(null, newUser);

        //return done(null, newUser);
        // Pass user object to Passport's req.user
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);

const isProduction = process.env.IS_PROD === "true";
 
passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      callbackURL: isProduction
  ? "https://solapay-backend.onrender.com/auth/discord/callback"
  : "http://localhost:5000/auth/discord/callback",
      //callbackURL: "http://localhost:5000/auth/discord/callback",
      //callbackURL: "https://solapay-backend.onrender.com/auth/discord/callback",

      //callbackURL: "/auth/discord/callback", Use relative (/auth/google/callback) only in production when behind a proxy like Nginx or Vercel.
      scope: ["identify", "email"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: DiscordProfile,
      done: VerifyCallback
    ) => {
      // try {
      //   let existingUser = await User.findOne({ discordId: profile.id });

      //   if (!existingUser) {
      //     existingUser = await User.findOne({ email: profile.email });
      //   }

      //   if (existingUser) return done(null, existingUser);

      //   // If user does not exist, create new user in DB
      //   const newUser = new User({
      //     discordId: profile.id,
      //     provider: "discord", // Mark provider as "google"
      //     name: profile.username, // Discord uses `username`, not `displayName`
      //     email: profile.email,
      //     imageUrl: profile.avatar
      //       ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
      //       : undefined,
      //     // Note: no password needed for OAuth users
      //   });

      //   // Save new user to database
      //   await newUser.save();
      //   return done(null, newUser);

      //   //       const newUser = new User({
      //   //         name: profile.username, // Discord uses `username`, not `displayName`
      //   //         email: profile.email,
      //   //         discordId: profile.id,
      //   //         image: profile.avatar
      //   //           ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
      //   //           : undefined,
      //   //       });

      //   // await newUser.save();
      //   // return done(null, newUser);
      // } catch (err) {
      //   return done(err as Error, undefined);
      //   console.error("OAuth Error:", err);
      // }
      try {
        console.log("Discord Profile:", profile);

        if (!profile.email) {
          console.error(
            "No email in Discord profile. Likely missing email scope."
          );
          return done(new Error("Email not returned from Discord"), undefined);
        }

        let existingUser = await User.findOne({ discordId: profile.id });

        if (!existingUser) {
          existingUser = await User.findOne({ email: profile.email });
        }

        if (existingUser) return done(null, existingUser);

        const newUser = new User({
          discordId: profile.id,
          provider: "discord",
          name: profile.username,
          email: profile.email,
          imageUrl: profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : undefined,
        });

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        console.error("OAuth Discord Error:", err);
        return done(err as Error, undefined);
      }

    }
  )
);

export default passport;

// improve it following google or discord
// TWITTER STRATEGY
// passport.use(
//     new TwitterStrategy.Strategy(
//       {
//         consumerKey: process.env.TWITTER_CLIENT_ID!,
//         consumerSecret: process.env.TWITTER_CLIENT_SECRET!,
//         callbackURL: "/auth/twitter/callback",
//         includeEmail: true,
//       },
//       async (_token, _tokenSecret, profile, done) => {
//         const existingUser = await User.findOne({ twitterId: profile.id });
//         if (existingUser) return done(null, existingUser);
  
//         const newUser = new User({
//           name: profile.displayName,
//           email: profile.emails?.[0].value,
//           twitterId: profile.id,
//         });
  
//         await newUser.save();
//         done(null, newUser);
//       }
//     )
//   );
