import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import http from "http";
import app from "../app.js";

async function runTests() {
  console.log("==================================================");
  console.log("SEC-009: RATE LIMITING VERIFICATION SUITE");
  console.log("==================================================\n");

  let server;

  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB for rate limit verification.\n");

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    const postJson = async (path, body = {}) => {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      let data = {};
      try {
        data = await response.json();
      } catch (_) {}
      return {
        status: response.status,
        headers: response.headers,
        body: data,
      };
    };

    // -------------------------------------------------------------------------
    // TEST 1: Auth Route Rate Limiting (/api/auth/login) - Max 10 attempts
    // -------------------------------------------------------------------------
    console.log("[TEST 1] Testing Auth Route Rate Limiting on /api/auth/login (Limit: 10)...");
    let hitRateLimitAuth = false;
    let auth429Response = null;

    for (let i = 1; i <= 12; i++) {
      const res = await postJson("/api/auth/login", {
        email: "ratelimit_test@vrtemple.com",
        password: "WrongPassword123!",
      });

      if (res.status === 429) {
        hitRateLimitAuth = true;
        auth429Response = res;
        console.log(`  Attempt ${i}: Successfully throttled with HTTP 429!`);
        break;
      } else {
        console.log(`  Attempt ${i}: Allowed (HTTP ${res.status})`);
      }
    }

    if (
      hitRateLimitAuth &&
      auth429Response.body.status === "fail" &&
      auth429Response.body.message.includes("Too many authentication attempts")
    ) {
      console.log("  [PASS] Auth endpoint properly throttles brute-force attempts with HTTP 429.\n");
    } else {
      throw new Error(`Test 1 Failed: Expected 429 on /api/auth/login after 10 attempts.`);
    }

    // -------------------------------------------------------------------------
    // TEST 2: Subscriber OTP Rate Limiting (/api/subscribers/subscribe) - Max 5
    // -------------------------------------------------------------------------
    console.log("[TEST 2] Testing OTP Request Rate Limiting on /api/subscribers/subscribe (Limit: 5)...");
    let hitRateLimitOtp = false;
    let otp429Response = null;

    for (let i = 1; i <= 7; i++) {
      const res = await postJson("/api/subscribers/subscribe", {
        type: "email",
        identifier: "ratelimit_devotee@vrtemple.com",
        name: "Devotee",
      });

      if (res.status === 429) {
        hitRateLimitOtp = true;
        otp429Response = res;
        console.log(`  Attempt ${i}: Successfully throttled with HTTP 429!`);
        break;
      } else {
        console.log(`  Attempt ${i}: Allowed (HTTP ${res.status})`);
      }
    }

    if (
      hitRateLimitOtp &&
      otp429Response.body.status === "fail" &&
      otp429Response.body.message.includes("Too many OTP requests")
    ) {
      console.log("  [PASS] OTP endpoint throttles request flooding with HTTP 429.\n");
    } else {
      throw new Error(`Test 2 Failed: Expected 429 on /api/subscribers/subscribe after 5 requests.`);
    }

    // -------------------------------------------------------------------------
    // TEST 3: Contact Form Rate Limiting (/api/contact) - Max 10
    // -------------------------------------------------------------------------
    console.log("[TEST 3] Testing Contact Form Rate Limiting on /api/contact (Limit: 10)...");
    let hitRateLimitContact = false;
    let contact429Response = null;

    for (let i = 1; i <= 12; i++) {
      const res = await postJson("/api/contact", {
        name: "Spammer",
        email: "spam@bot.com",
        subject: "Spam",
        message: "Spam message payload",
      });

      if (res.status === 429) {
        hitRateLimitContact = true;
        contact429Response = res;
        console.log(`  Attempt ${i}: Successfully throttled with HTTP 429!`);
        break;
      } else {
        console.log(`  Attempt ${i}: Allowed (HTTP ${res.status})`);
      }
    }

    if (
      hitRateLimitContact &&
      contact429Response.body.status === "fail" &&
      contact429Response.body.message.includes("Too many message submissions")
    ) {
      console.log("  [PASS] Contact form throttles spam submissions with HTTP 429.\n");
    } else {
      throw new Error(`Test 3 Failed: Expected 429 on /api/contact after 10 submissions.`);
    }

    // Clean up test contact messages
    try {
      await mongoose.connection.collection("messages").deleteMany({ email: "spam@bot.com" });
    } catch (_) {}

    server.close();
    await mongoose.disconnect();

    console.log("==================================================");
    console.log("ALL SEC-009 RATE LIMITING TESTS PASSED! ✅");
    console.log("==================================================");
  } catch (err) {
    console.error("\nTEST SUITE FAILED:", err);
    if (server) server.close();
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
}

runTests();
