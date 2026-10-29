import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import express from "express";
import http from "http";
import generateToken, { getJwtSecret } from "../shared/utils/generateToken.js";
import { protect } from "../modules/auth/auth.middleware.js";
import User from "../modules/auth/user.model.js";
import { errorHandler } from "../shared/middlewares/error.middleware.js";

dotenv.config();

async function runJwtTests() {
  let server;
  let testUser;
  try {
    console.log("==========================================");
    console.log("RUNNING SEC-002: JWT HARDCODED FALLBACK TESTS");
    console.log("==========================================");

    // TEST 1: Verify getJwtSecret() refuses missing or short secrets
    console.log("\n[TEST 1] Testing rejection of missing or weak JWT_SECRET...");
    const originalSecret = process.env.JWT_SECRET;

    delete process.env.JWT_SECRET;
    let caughtUnset = false;
    try {
      getJwtSecret();
    } catch (e) {
      caughtUnset = true;
      console.log("Caught expected error for unset JWT_SECRET:", e.message);
    }
    if (!caughtUnset) {
      throw new Error("FAIL: getJwtSecret() did not throw for unset JWT_SECRET!");
    }

    process.env.JWT_SECRET = "short_secret_under_32_chars";
    let caughtShort = false;
    try {
      getJwtSecret();
    } catch (e) {
      caughtShort = true;
      console.log("Caught expected error for short JWT_SECRET:", e.message);
    }
    if (!caughtShort) {
      throw new Error("FAIL: getJwtSecret() did not throw for short JWT_SECRET!");
    }
    console.log("PASS: Insecure / missing secrets are strictly rejected.");

    // Restore valid secret
    process.env.JWT_SECRET = originalSecret;
    const validSecret = getJwtSecret();
    console.log(`PASS: Valid secret loaded (${validSecret.length} chars).`);

    // Connect DB for integration tests
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    testUser = await User.create({
      name: "JWT Test User",
      email: `jwt_test_${Date.now()}@vrtemple-test.com`,
      password: "Password123!",
      role: "admin",
    });

    const app = express();
    app.use(express.json());
    app.get("/api/protected-test", protect, (req, res) => {
      res.json({ success: true, message: "Access granted", user: req.user._id });
    });
    app.use(errorHandler);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const testUrl = `http://localhost:${port}/api/protected-test`;

    // TEST 2: Attacker crafts a token using the old "fallback_secret"
    console.log("\n[TEST 2] Attacker submits token signed with 'fallback_secret'...");
    const forgedToken = jwt.sign(
      { id: testUser._id },
      "fallback_secret",
      { expiresIn: "1h" }
    );

    const resForged = await fetch(testUrl, {
      headers: { Authorization: `Bearer ${forgedToken}` },
    });
    const dataForged = await resForged.json();
    console.log("HTTP Status:", resForged.status);
    console.log("Response:", dataForged.message);

    if (resForged.status !== 401) {
      throw new Error(`FAIL: Forged token was not rejected! Status: ${resForged.status}`);
    }
    console.log("PASS: Forged token with fallback_secret was rejected with 401 Unauthorized!");

    // TEST 3: Legitimate user with valid token generated via generateToken()
    console.log("\n[TEST 3] Submitting token signed with legitimate strong secret...");
    const validToken = generateToken(testUser._id);
    const resValid = await fetch(testUrl, {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    const dataValid = await resValid.json();
    console.log("HTTP Status:", resValid.status);
    console.log("Response:", dataValid.message);

    if (resValid.status !== 200 || !dataValid.success) {
      throw new Error(`FAIL: Valid token failed authentication! Status: ${resValid.status}`);
    }
    console.log("PASS: Legitimate token successfully authenticated.");

    console.log("\n==========================================");
    console.log("ALL JWT SECURITY TESTS PASSED! ✅");
    console.log("==========================================");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    process.exitCode = 1;
  } finally {
    if (testUser) {
      await User.deleteOne({ _id: testUser._id });
    }
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  }
}

runJwtTests();

