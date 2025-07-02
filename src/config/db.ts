import mongoose from "mongoose" // Import mongoose to interact with MongoDB
import dotenv from "dotenv" // Import dotenv to load environment variables from .env



dotenv.config()// Initialize dotenv to read variables in .env (like MONGO_URI)


// Create an async function to connect to the MongoDB database
const connectDB = async () => {
    try {
      // Use mongoose to connect to the MongoDB URI from environment variables
      await mongoose.connect(process.env.MONGO_URI!);

      // If connection is successful, log this message
      console.log("✅ MongoDB connected");
    } catch (error) {
      // If connection fails, show error in console
        console.log("❌ MongoDB connection failed", error);
        

      // Stop the app if the database connection fails
      process.exit(1);
    }
}



// Export the function so we can use it in other files (like index.ts)
export default connectDB