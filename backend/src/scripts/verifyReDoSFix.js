import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.resolve(__dirname, "../../../backend/.env") });
}
if (!process.env.MONGO_URI) {
  dotenv.config();
}

import mongoose from "mongoose";
import http from "http";
import app from "../app.js";
import User from "../modules/auth/user.model.js";
import Category from "../modules/category/category.model.js";
import Gallery from "../modules/gallery/gallery.model.js";
import { Event } from "../modules/events/events.model.js";
import generateToken from "../shared/utils/generateToken.js";
import { escapeRegex } from "../shared/utils/escapeRegex.js";

async function runTests() {
  console.log("==================================================");
  console.log("SEC-012: REGULAR EXPRESSION DENIAL OF SERVICE (ReDoS) VERIFICATION");
  console.log("==================================================\n");

  let server;
  let adminUser;
  let testCat;
  let testGallery;
  let testEvent;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Unit Test - escapeRegex utility
    // -------------------------------------------------------------------------
    console.log("[TEST 1] Testing escapeRegex utility function...");

    const maliciousPatterns = [
      "((((((a+)+)+)+)+)+)$",
      "(a+)+$",
      "^[a-zA-Z0-9]+([a-zA-Z0-9]+)+$",
      "[a-z]*?+^$|()[]{}",
      "\\d+\\w+.*",
    ];

    for (const pattern of maliciousPatterns) {
      const escaped = escapeRegex(pattern);
      // Ensure escaped string can be safely compiled into RegExp without crashing
      const reg = new RegExp(escaped, "i");
      // Ensure characters that were metacharacters are now escaped
      if (!reg.test(pattern)) {
        throw new Error(`escapeRegex failed to match literal pattern: ${pattern}`);
      }
    }

    // Verify invalid / empty input handling
    if (escapeRegex(null) !== "" || escapeRegex(undefined) !== "" || escapeRegex("   ") !== "") {
      throw new Error("escapeRegex failed to handle empty / non-string inputs safely.");
    }

    // Verify length limiting
    const veryLongString = "a".repeat(500);
    if (escapeRegex(veryLongString).length > 200) {
      throw new Error("escapeRegex failed to enforce maxLength boundary.");
    }

    console.log("  ✓ escapeRegex correctly escapes metacharacters and handles edge cases.\n");

    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vitthal_rakhumai";
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB for API verification tests.\n");

    // Create an admin user for authenticated endpoints
    adminUser = await User.create({
      name: "ReDoS Admin",
      email: `redos_admin_${Date.now()}@vrtemple-test.com`,
      password: "AdminPassword123!",
      role: "admin",
    });
    const adminToken = generateToken(adminUser._id);

    // Create a test category, gallery item, and event
    testCat = await Category.create({
      name: `Test Cat (Special) + ${Date.now()}`,
      description: "ReDoS test category",
    });

    testGallery = await Gallery.create({
      title: "Vitthal Idol Special Photo [2026]",
      description: "Photo of Lord Vitthal with (tulsi) garland",
      category: testCat._id,
      mediaUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      publicId: "test_gallery_public_id",
      mediaType: "image",
    });

    testEvent = await Event.create({
      title: "Ashadhi Ekadashi (Annual Palkhi + Mahapuja)",
      description: "Grand celebration in temple hall [Main]",
      location: "Pandharpur / Temple Hall",
      year: 2026,
    });

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    // -------------------------------------------------------------------------
    // TEST 2: Gallery Search with ReDoS and Malformed Regex Payloads
    // -------------------------------------------------------------------------
    console.log("[TEST 2] Testing /api/gallery search with ReDoS & syntax payloads...");

    const galleryPayloads = [
      "((((((a+)+)+)+)+)+)$",
      "[[[[[[[[[[a-z]",
      "*(+?|^$)",
      "Special Photo [2026]",
    ];

    for (const q of galleryPayloads) {
      const url = `${baseUrl}/api/gallery?search=${encodeURIComponent(q)}`;
      const startTime = Date.now();
      const res = await fetch(url);
      const elapsed = Date.now() - startTime;

      if (res.status !== 200) {
        throw new Error(`Search request failed with status ${res.status} for query: ${q}`);
      }

      const body = await res.json();
      console.log(`  ✓ Query "${q.slice(0, 25)}" -> Status: ${res.status}, Time: ${elapsed}ms, Results: ${body.count}`);

      if (elapsed > 2000) {
        throw new Error(`Query took too long (${elapsed}ms) - potential ReDoS lingering!`);
      }
    }
    console.log("  ✓ All gallery ReDoS search queries passed cleanly in milliseconds.\n");

    // -------------------------------------------------------------------------
    // TEST 3: Events Search with ReDoS and Malformed Regex Payloads
    // -------------------------------------------------------------------------
    console.log("[TEST 3] Testing /api/events search with ReDoS payloads...");

    const eventPayloads = [
      "((((((a+)+)+)+)+)+)$",
      "Ashadhi (Annual Palkhi + Mahapuja)",
      "+*?^$()[]{}",
    ];

    for (const q of eventPayloads) {
      const url = `${baseUrl}/api/events?search=${encodeURIComponent(q)}`;
      const startTime = Date.now();
      const res = await fetch(url);
      const elapsed = Date.now() - startTime;

      if (res.status !== 200) {
        throw new Error(`Events search failed with status ${res.status} for query: ${q}`);
      }

      const body = await res.json();
      console.log(`  ✓ Query "${q.slice(0, 25)}" -> Status: ${res.status}, Time: ${elapsed}ms, Results: ${body.count}`);
    }
    console.log("  ✓ All events search queries executed safely.\n");

    // -------------------------------------------------------------------------
    // TEST 4: Sports Admin Registrations Search with ReDoS Payloads
    // -------------------------------------------------------------------------
    console.log("[TEST 4] Testing /api/sports/admin/registrations search with ReDoS payloads...");

    const sportsUrl = `${baseUrl}/api/sports/admin/registrations?search=${encodeURIComponent("((((((a+)+)+)+)+)+)$")}`;
    const sportsRes = await fetch(sportsUrl, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (sportsRes.status !== 200) {
      throw new Error(`Sports registrations search failed with status ${sportsRes.status}`);
    }
    const sportsData = await sportsRes.json();
    console.log(`  ✓ Sports admin search responded: Status: ${sportsRes.status}, Total: ${sportsData.total}`);
    console.log("  ✓ Sports registration search safely neutralizes ReDoS payloads.\n");

    // -------------------------------------------------------------------------
    // TEST 5: Category Creation & Duplicate Name Check with Regex Special Characters
    // -------------------------------------------------------------------------
    console.log("[TEST 5] Testing category creation with regex metacharacters...");

    const specialCatName = `Special (Group) + [Category] * ${Date.now()}`;
    const createCatRes = await fetch(`${baseUrl}/api/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: specialCatName,
        description: "Category with regex special characters",
      }),
    });

    if (createCatRes.status !== 201) {
      const err = await createCatRes.json();
      throw new Error(`Failed to create category with special chars: ${JSON.stringify(err)}`);
    }

    console.log("  ✓ Created category with special chars successfully.");

    // Attempting to create duplicate should be detected by exact literal match rather than regex syntax error
    const dupCatRes = await fetch(`${baseUrl}/api/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: specialCatName,
        description: "Duplicate check",
      }),
    });

    if (dupCatRes.status !== 400) {
      throw new Error(`Expected 400 duplicate error, received: ${dupCatRes.status}`);
    }

    console.log("  ✓ Duplicate detection correctly matched literal string without regex error.\n");

    console.log("==================================================");
    console.log("ALL SEC-012 ReDoS FIX TESTS PASSED SUCCESSFULLY! (5/5)");
    console.log("==================================================");
  } finally {
    // Cleanup created test records
    if (adminUser) await User.findByIdAndDelete(adminUser._id).catch(() => {});
    if (testCat) await Category.findByIdAndDelete(testCat._id).catch(() => {});
    if (testGallery) await Gallery.findByIdAndDelete(testGallery._id).catch(() => {});
    if (testEvent) await Event.findByIdAndDelete(testEvent._id).catch(() => {});
    await Category.deleteMany({ name: /Special \(Group\)/ }).catch(() => {});

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.disconnect().catch(() => {});
  }
}

runTests().catch((err) => {
  console.error("\n❌ TEST SUITE FAILED:", err);
  process.exit(1);
});
