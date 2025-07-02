import mongoose, { Document, Schema } from "mongoose"; // Import mongoose for creating schema and model

// Create a TypeScript interface to define what fields a User will have
export interface IUser extends Document {
  name: string; // Full name of the user
  userId: string;
  //imageUrl: string;
  email: string; // Email address (must be unique)
  imageUrl: string;
  password: string; // Hashed password
  provider?: string; // Optional field: Google, Discord, etc.
  createdAt: Date; // Automatically set when the user is created
  lastFundedAt: Date
}

// Define the schema for the User model (structure of user documents)
const UserSchema: Schema = new Schema<IUser>(
  {
    name: {
      type: String, // Field type
      required: true, // Field must be present
      trim: true, // Remove whitespace from start/end
    },
    userId: {
      type: String, // Field type
      required: false, // Field must be present
      trim: true,
    },
    imageUrl: {
      type: String, // Field type
      default: "", // or null
      //  required: false, // Field must be present
      //  trim: true, // Remove whitespace from start/end
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true, // No two users can have the same email
      lowercase: true, // Automatically convert email to lowercase
    },
    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
      minlength: 8, // Password must be at least 8 characters
    },
    provider: {
      type: String, // Optional: used if user logs in via Google, Discord, etc.
      default: "local",
      required: true,
      enum: ["local", "x", "google", "telegram", "discord"],
    },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically set to current date/time
    },
    lastFundedAt: {
      type: Date,
      default: null,
    },
  },
  {
    versionKey: false, // Disable "__v" version field in documents
  }
);

export default mongoose.model<IUser>("User", UserSchema);

// | Concept             | Description                                                  |
// | ------------------- | ------------------------------------------------------------ |
// | `IUser`             | TypeScript interface defining what fields our User will have |
// | `Schema`            | Blueprint of the MongoDB document (data structure)           |
// | `model()`           | Turns the schema into a real collection (e.g., `users`)      |
// | `trim`              | Removes extra whitespace                                     |
// | `lowercase`         | Ensures consistency in email storage                         |
// | `enum`              | Limits values for `provider` to specific choices             |
// | `default: Date.now` | Automatically timestamps user creation                       |
// | `versionKey: false` | Prevents Mongoose from adding a `__v` field                  |

// Why Use a Model?
// Helps enforce data structure

// Prevents bad data from entering the database

// Central place to define and validate users
