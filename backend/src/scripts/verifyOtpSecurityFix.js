import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import crypto from "crypto";
import app from "../app.js";
import { Subscriber } from "../modules/subscriber/subscriber.model.js";

dotenv.config();

async function runOtpTests() {
  let server;
  const testPhone = `+9199999${Math.floor(10000 + Math.random() * 90000)}`;
  const testEmail = `otp_test_${Date.now()}@vrtemple-test.com`;

  try {
    console.log("==================================================");
    console.log("RUNNING SEC-005: OTP SECURITY VERIFICATION");
    console.log("==================================================");

    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}/api/subscribers`;

    // TEST 1: Request OTP and verify response does NOT leak OTP
    console.log("\n[TEST 1] Devotee requests subscription OTP...");
    const resSubscribe = await fetch(`${baseUrl}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Devotee",
        email: testEmail,
        phone: testPhone,
      }),
    });

    const dataSubscribe = await resSubscribe.json();
    console.log("HTTP Status:", resSubscribe.status);
    console.log("Response Keys:", Object.keys(dataSubscribe));

    if (dataSubscribe.otp !== undefined) {
      throw new Error(`FAIL: OTP was exposed in API response! Value: ${dataSubscribe.otp}`);
    }
    console.log("PASS: Response does NOT leak plaintext OTP.");

    // TEST 2: Verify OTP is hashed in MongoDB
    console.log("\n[TEST 2] Verifying database storage format...");
    const subscriberInDb = await Subscriber.findOne({ phone: testPhone });
    if (!subscriberInDb) {
      throw new Error("FAIL: Subscriber record not found in database!");
    }

    console.log("Stored OTP Hash Length:", subscriberInDb.otp?.length);
    console.log("Stored OTP Value:", subscriberInDb.otp);

    // Ensure it's a 64-character hex string (SHA-256) and NOT a 6-digit plain number
    if (!subscriberInDb.otp || subscriberInDb.otp.length !== 64 || /^\d{6}$/.test(subscriberInDb.otp)) {
      throw new Error(`FAIL: Stored OTP is not a 64-char SHA-256 hash! Value: ${subscriberInDb.otp}`);
    }
    console.log("PASS: OTP is stored strictly as a 64-character SHA-256 hash, not cleartext.");

    // TEST 3: Attempt verification with invalid OTP
    console.log("\n[TEST 3] Attacker attempts verification with incorrect OTP...");
    const resInvalid = await fetch(`${baseUrl}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: testPhone,
        otp: "000000",
      }),
    });

    console.log("HTTP Status:", resInvalid.status);
    if (resInvalid.status !== 400) {
      throw new Error(`FAIL: Expected 400 on invalid OTP, got ${resInvalid.status}`);
    }
    console.log("PASS: Invalid OTP rejected with 400.");

    // TEST 4: We can verify using the known hash preimage by brute forcing 6 digits against SHA-256 hash in test
    console.log("\n[TEST 4] Simulating legitimate devotee entering the correct received OTP...");
    let foundOtp = null;
    for (let i = 100000; i <= 999999; i++) {
      const h = crypto.createHash("sha256").update(String(i)).digest("hex");
      if (h === subscriberInDb.otp) {
        foundOtp = String(i);
        break;
      }
    }

    if (!foundOtp) {
      throw new Error("FAIL: Could not verify generated OTP space (not 6 digits)!");
    }
    console.log(`Found matching OTP in 6-digit range: ${foundOtp}`);

    const resValid = await fetch(`${baseUrl}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: testPhone,
        otp: foundOtp,
      }),
    });
    const dataValid = await resValid.json();
    console.log("HTTP Status:", resValid.status);
    console.log("Response Message:", dataValid.message);

    if (resValid.status !== 200) {
      throw new Error(`FAIL: Expected 200 on valid OTP, got ${resValid.status}`);
    }

    const verifiedSub = await Subscriber.findOne({ phone: testPhone });
    if (!verifiedSub.isVerified || verifiedSub.otp !== undefined) {
      throw new Error("FAIL: Subscriber was not properly marked verified or OTP was not cleared!");
    }
    console.log("PASS: Legitimate OTP verified subscriber and cleared the OTP secret.");

    console.log("\n==================================================");
    console.log("ALL OTP SECURITY TESTS PASSED! ✅");
    console.log("==================================================");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    process.exitCode = 1;
  } finally {
    console.log("\nCleaning up test subscriber...");
    await Subscriber.deleteMany({ phone: testPhone });
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  }
}

runOtpTests();

