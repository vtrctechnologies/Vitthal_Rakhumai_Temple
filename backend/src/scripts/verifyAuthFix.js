import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import http from "http";
import authRoutes from "../modules/auth/auth.routes.js";
import User from "../modules/auth/user.model.js";
import generateToken from "../shared/utils/generateToken.js";
import { errorHandler } from "../shared/middlewares/error.middleware.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(errorHandler);

async function runTests() {
  let server;
  const testEmails = [];
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB.");

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}/api/auth`;
    console.log(`Test server running on port ${port}`);

    // TEST 1: Public registration with role: "admin"
    const testEmail1 = `test_attacker_${Date.now()}@vrtemple-test.com`;
    testEmails.push(testEmail1);

    console.log("\n[TEST 1] Attacker attempts privilege escalation via POST /api/auth/register with role='admin'...");
    const res1 = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Malicious User",
        email: testEmail1,
        password: "Password123!",
        role: "admin",
      }),
    });
    const data1 = await res1.json();
    console.log("HTTP Status:", res1.status);
    console.log("Response Role:", data1.data?.role);

    if (data1.data?.role !== "user") {
      throw new Error(`FAIL: Expected role to be 'user', got '${data1.data?.role}'`);
    }

    const dbUser1 = await User.findOne({ email: testEmail1 });
    console.log("DB Persisted Role:", dbUser1.role);
    if (dbUser1.role !== "user") {
      throw new Error(`FAIL: Database record has role '${dbUser1.role}', expected 'user'`);
    }
    console.log("PASS: Public registration strictly enforced role='user'. Attacker was NOT given admin rights!");

    // TEST 2: Public registration with arbitrary role (e.g. 'superadmin')
    const testEmail2 = `test_attacker2_${Date.now()}@vrtemple-test.com`;
    testEmails.push(testEmail2);

    console.log("\n[TEST 2] Attacker attempts privilege escalation with role='superadmin'...");
    const res2 = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Malicious User 2",
        email: testEmail2,
        password: "Password123!",
        role: "superadmin",
      }),
    });
    const data2 = await res2.json();
    console.log("HTTP Status:", res2.status);
    console.log("Response Role:", data2.data?.role);

    if (data2.data?.role !== "user") {
      throw new Error(`FAIL: Expected role to be 'user', got '${data2.data?.role}'`);
    }
    const dbUser2 = await User.findOne({ email: testEmail2 });
    if (dbUser2.role !== "user") {
      throw new Error(`FAIL: DB record role is '${dbUser2.role}'`);
    }
    console.log("PASS: Arbitrary role parameter completely neutralized.");

    // TEST 3: Unauthenticated call to POST /api/auth/users
    console.log("\n[TEST 3] Unauthenticated caller attempts to create user via POST /api/auth/users...");
    const res3 = await fetch(`${baseUrl}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Unauthorized Creation",
        email: "unauth@vrtemple-test.com",
        password: "Password123!",
        role: "admin",
      }),
    });
    console.log("HTTP Status:", res3.status);
    if (res3.status !== 401) {
      throw new Error(`FAIL: Expected 401 Unauthorized, got ${res3.status}`);
    }
    console.log("PASS: Unauthenticated user creation blocked (401).");

    // TEST 4: Standard 'user' role token calls POST /api/auth/users
    console.log("\n[TEST 4] Standard user token attempts to create an admin via POST /api/auth/users...");
    const userToken = generateToken(dbUser1._id);
    const res4 = await fetch(`${baseUrl}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name: "Escalated User",
        email: "escalated@vrtemple-test.com",
        password: "Password123!",
        role: "admin",
      }),
    });
    console.log("HTTP Status:", res4.status);
    if (res4.status !== 403) {
      throw new Error(`FAIL: Expected 403 Forbidden, got ${res4.status}`);
    }
    console.log("PASS: Standard user forbidden from creating accounts (403).");

    // TEST 5: Legitimate admin creates an admin via POST /api/auth/users
    console.log("\n[TEST 5] Legitimate admin creates a new admin user via POST /api/auth/users...");
    const testAdminEmail = `test_admin_${Date.now()}@vrtemple-test.com`;
    const adminUser = await User.create({
      name: "Test Admin",
      email: testAdminEmail,
      password: "Password123!",
      role: "admin",
    });
    testEmails.push(testAdminEmail);
    const adminToken = generateToken(adminUser._id);

    const createdAdminEmail = `test_created_admin_${Date.now()}@vrtemple-test.com`;
    testEmails.push(createdAdminEmail);

    const res5 = await fetch(`${baseUrl}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: "New Admin",
        email: createdAdminEmail,
        password: "Password123!",
        role: "admin",
      }),
    });
    const data5 = await res5.json();
    console.log("HTTP Status:", res5.status);
    console.log("Created User Role:", data5.data?.role);
    if (res5.status !== 201 || data5.data?.role !== "admin") {
      throw new Error(`FAIL: Legitimate admin creation failed, status ${res5.status}`);
    }
    const dbAdminUser = await User.findOne({ email: createdAdminEmail });
    if (dbAdminUser.role !== "admin") {
      throw new Error(`FAIL: DB user role is '${dbAdminUser.role}'`);
    }
    console.log("PASS: Authenticated admin successfully created an admin account.");

    console.log("\n==========================================");
    console.log("ALL PRIVILEGE ESCALATION TESTS PASSED! ✅");
    console.log("==========================================");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    process.exitCode = 1;
  } finally {
    // Cleanup test users
    if (testEmails.length > 0) {
      console.log("\nCleaning up test users from DB...");
      await User.deleteMany({ email: { $in: testEmails } });
      console.log(`Cleaned up ${testEmails.length} test records.`);
    }
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  }
}

runTests();
