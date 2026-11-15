import dns from "node:dns";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error(
        "MONGO_URI is missing! Please configure it in your backend/.env file."
      );
    }

    // Fix Windows/local DNS SRV ECONNREFUSED/ETIMEOUT for mongodb+srv:// URIs
    if (mongoUri.startsWith("mongodb+srv://")) {
      try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
      } catch {
        // Ignore if DNS servers cannot be overridden in restricted environments
      }
    }

    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
