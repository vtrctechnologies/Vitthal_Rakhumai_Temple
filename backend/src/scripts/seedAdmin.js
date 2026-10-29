/**
 * CLI Admin Seed Script
 * 
 * Securely creates or updates an administrator account from the server environment.
 * 
 * Usage:
 *   npm run seed:admin
 *   node src/scripts/seedAdmin.js [email] [password] [name]
 * 
 * Environment Variables (optional):
 *   ADMIN_EMAIL=admin@vrtemple.com
 *   ADMIN_PASSWORD=Admin@123456
 *   ADMIN_NAME="Temple Administrator"
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../modules/auth/user.model.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("❌ Error: MONGO_URI is missing in environment variables (.env)");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB successfully.");

    const args = process.argv.slice(2);
    const email = (process.env.ADMIN_EMAIL || args[0] || "admin@vrtemple.com").toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD || args[1] || "Admin@123456";
    const name = (process.env.ADMIN_NAME || args[2] || "Temple Administrator").trim();

    if (password.length < 6) {
      console.error("❌ Error: Password must be at least 6 characters.");
      process.exit(1);
    }

    let existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`ℹ️ User found with email: ${email} (current role: ${existingUser.role})`);
      if (existingUser.role !== "admin") {
        existingUser.role = "admin";
        await existingUser.save();
        console.log(`✅ Promoted ${email} to admin role.`);
      } else {
        console.log(`✅ User ${email} is already an admin.`);
      }
    } else {
      const newAdmin = await User.create({
        name,
        email,
        password,
        role: "admin",
      });
      console.log(`✅ Admin account created successfully!`);
      console.log(`   ID:    ${newAdmin._id}`);
      console.log(`   Name:  ${newAdmin.name}`);
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Role:  ${newAdmin.role}`);
    }

    await mongoose.disconnect();
    console.log("Operation complete.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error running seedAdmin:", error.message);
    process.exit(1);
  }
};

seedAdmin();

