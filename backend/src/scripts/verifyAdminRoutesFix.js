import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import app from "../app.js";
import User from "../modules/auth/user.model.js";
import generateToken from "../shared/utils/generateToken.js";

dotenv.config();

async function runTests() {
  let server;
  let regularUser;
  let adminUser;

  try {
    console.log("==================================================");
    console.log("RUNNING SEC-004: ROUTE AUTHORIZATION VERIFICATION");
    console.log("==================================================");

    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });

    regularUser = await User.create({
      name: "Regular Devotee",
      email: `regular_${Date.now()}@vrtemple-test.com`,
      password: "Password123!",
      role: "user",
    });

    adminUser = await User.create({
      name: "Temple Admin",
      email: `admin_${Date.now()}@vrtemple-test.com`,
      password: "Password123!",
      role: "admin",
    });

    const userToken = generateToken(regularUser._id);
    const adminToken = generateToken(adminUser._id);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}/api`;

    const endpoints = [
      { name: "Sports Registrations Export", url: `${baseUrl}/sports/admin/registrations/export`, method: "GET" },
      { name: "Hero Management List", url: `${baseUrl}/hero`, method: "GET" },
      { name: "Live Programs Admin Category List", url: `${baseUrl}/live-programs/categories/admin/all`, method: "GET" },
      { name: "Admin Notifications List", url: `${baseUrl}/notifications`, method: "GET" },
      { name: "Subscribers List", url: `${baseUrl}/subscribers`, method: "GET" },
    ];

    console.log("\n1. Testing Standard 'user' access (Must all be 403 Forbidden):");
    for (const ep of endpoints) {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log(`   [USER TEST] ${ep.name} -> HTTP ${res.status}`);
      if (res.status !== 403) {
        throw new Error(`FAIL: Standard user was not forbidden on ${ep.name}! Expected 403, got ${res.status}`);
      }
    }
    console.log("   ✅ All endpoints returned 403 Forbidden for standard user.");

    console.log("\n2. Testing Authenticated 'admin' access (Must NOT be 403):");
    for (const ep of endpoints) {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log(`   [ADMIN TEST] ${ep.name} -> HTTP ${res.status}`);
      if (res.status === 403 || res.status === 401) {
        throw new Error(`FAIL: Admin was denied access on ${ep.name}! Got ${res.status}`);
      }
    }
    console.log("   ✅ All endpoints authorized legitimate admin successfully.");

    console.log("\n==================================================");
    console.log("ALL ROUTE AUTHORIZATION TESTS PASSED! ✅");
    console.log("==================================================");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    process.exitCode = 1;
  } finally {
    if (regularUser) {
      await User.deleteOne({ _id: regularUser._id });
    }
    if (adminUser) {
      await User.deleteOne({ _id: adminUser._id });
    }
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  }
}

runTests();

