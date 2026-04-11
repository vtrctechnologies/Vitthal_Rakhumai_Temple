/**
 * Seed script to create sample gallery categories
 * Run with: node src/scripts/seedGalleryCategories.js
 *
 * Make sure you have at least one admin user in the database first!
 */

require("dotenv").config();
import mongoose from "mongoose";
const GalleryCategory = require("../models/GalleryCategory");
const Admin = require("../models/Admin");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const seedCategories = async () => {
  try {
    await connectDB();

    // Get the first admin user (required for createdBy field)
    const admin = await Admin.findOne();
    if (!admin) {
      console.error(
        "❌ Error: No admin user found. Please create an admin user first using the register API."
      );
      process.exit(1);
    }

    console.log(`✅ Found admin: ${admin.username} (${admin.email})`);

    // Sample categories
    const categories = [
      {
        name: "Temple",
        description: "Temple architecture, interiors, and sacred spaces",
        order: 1,
        isActive: true,
        createdBy: admin._id,
      },
      {
        name: "Festival",
        description: "Festival celebrations, events, and religious ceremonies",
        order: 2,
        isActive: true,
        createdBy: admin._id,
      },
      {
        name: "Art",
        description:
          "Traditional art, mandala designs, and decorative patterns",
        order: 3,
        isActive: true,
        createdBy: admin._id,
      },
    ];

    // Clear existing categories (optional - comment out if you want to keep existing)
    // await GalleryCategory.deleteMany({});
    // console.log("🗑️  Cleared existing categories");

    // Check which categories already exist
    const existingCategories = await GalleryCategory.find({
      name: { $in: categories.map((c) => c.name) },
    });

    if (existingCategories.length > 0) {
      console.log(
        `⚠️  Found ${existingCategories.length} existing categories. Skipping duplicates.`
      );
      existingCategories.forEach((cat) => {
        console.log(`   - ${cat.name} (slug: ${cat.slug})`);
      });
    }

    // Insert categories (skip duplicates)
    let created = 0;
    let skipped = 0;

    for (const categoryData of categories) {
      const existing = await GalleryCategory.findOne({
        name: categoryData.name,
      });

      if (existing) {
        console.log(`⏭️  Skipping "${categoryData.name}" - already exists`);
        skipped++;
      } else {
        const category = await GalleryCategory.create(categoryData);
        console.log(
          `✅ Created category: "${category.name}" (slug: ${category.slug}, ID: ${category._id})`
        );
        created++;
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${await GalleryCategory.countDocuments()}`);

    // Display all categories
    const allCategories = await GalleryCategory.find().sort({ order: 1 });
    console.log("\n📋 All Categories:");
    allCategories.forEach((cat) => {
      console.log(
        `   - ${cat.name} (slug: ${cat.slug}, ID: ${cat._id}, order: ${cat.order})`
      );
    });

    console.log("\n✅ Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

// Run the seed
seedCategories();
