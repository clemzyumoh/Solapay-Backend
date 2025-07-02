
//import Jwt  from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import  Jwt  from "jsonwebtoken";


// Extend the Request type to allow attaching the decoded user to the request object
interface AutheticatedResquest extends Request {
  user?: any; // Optional `user` property we will attach after decoding the token
  //id: string; // or _id if you use that
}


// Middleware function to verify JWT
const verifyToken = (req: AutheticatedResquest, res: Response, next: NextFunction) => {
  // Get the Authorization header from the request (usually: "Bearer <token>")
  //const authHeaders = req.headers.authorization;
//   const authHeaders = req.cookies.token; // ✅ Get token from cookie
//   // If the header is missing or not in the format "Bearer <token>", reject the request
//   if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
//     return void res.status(401).json({ message: "No Token found" });
//   }

//   // Extract the actual token from the header
//   // Example: "Bearer abcd.efgh.ijkl" → "abcd.efgh.ijkl"
//     const token = authHeaders.split(" ")[1];
    

  const token = req.cookies.token;
  console.log("Incoming cookies:", req.cookies);

  if (!token) {
    return void res.status(401).json({ message: "No Token found" });
  }
  
  try {
    // Try to verify the token using the secret from your .env file
    const decode = Jwt.verify(token, process.env.JWT_SECRET!); // as string

    // Attach the decoded user data to the request object (for use in protected routes)
    req.user = decode;

    // Call next() to pass control to the next middleware or route handler
    next();
  } catch (error) {
    // If verification fails (e.g. invalid or expired token), send unauthorized error
    return void res.status(401).json({ message: "invali or expired Token" });
  }
}

// Export the middleware so it can be used in other files
export default verifyToken



// What is a JWT?
// A JWT (JSON Web Token) is like a digital ID card that a user carries after logging in.
// It's:

// Small

// Secure

// Self-contained (holds user info like ID/email inside)

// And signed so it can’t be faked.

// 🔐 Why use JWT?
// To protect routes and verify users without asking for their password every time.

// Think of it like this:

// ✅ You log in once → 🪪 you get a JWT →
// 🔐 You show that JWT every time you want to access protected routes (like /dashboard).

// 🔄 How JWT works — full flow
// 1. User Registers/Login
// The backend checks credentials

// ✅ If valid, it creates a JWT

// Sends that token to the frontend

// ts
// Copy
// Edit
// const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//   expiresIn: "1d",
// });
// Inside the token is data like:

// json
// Copy
// Edit
// {
//   "userId": "abc123",
//   "iat": 1717420100,
//   "exp": 1717506500
// }
// 2. Frontend Stores the Token
// Usually in localStorage or cookies

// js
// Copy
// Edit
// localStorage.setItem("token", token);
// 3. Frontend Sends Token with Requests
// When making a request to a protected route:

// js
// Copy
// Edit
// fetch("/api/protected", {
//   headers: {
//     Authorization: "Bearer " + token
//   }
// })
// 4. Backend Verifies the Token
// It extracts the token from req.headers.authorization

// Then uses JWT_SECRET to check if it’s real

// ts
// Copy
// Edit
// const decoded = jwt.verify(token, process.env.JWT_SECRET);
// If valid: ✅ allow access

// If invalid or expired: ❌ deny access

// 🛡️ Why JWT_SECRET?
// The JWT_SECRET is the private key only the backend knows.

// It’s used to sign and verify tokens.

// If someone tries to fake a token, it won’t match the secret, and verification fails.