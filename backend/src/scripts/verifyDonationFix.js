import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import http from "http";
import crypto from "crypto";
import app from "../app.js";
import Donation from "../modules/donation/donation.model.js";

async function runTests() {
  console.log("=================================================");
  console.log("SEC-003: Razorpay Payment Verification Test Suite");
  console.log("=================================================\n");

  const testKeySecret = process.env.RAZORPAY_KEY_SECRET || "test_secret_for_razorpay_suite_1234";
  process.env.RAZORPAY_KEY_SECRET = testKeySecret;

  let server;
  let baseUrl;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for verification tests.\n");

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;

    // Clean up any test records
    await Donation.deleteMany({ email: /@security-test\.local$/ });

    // Helper to generate Razorpay HMAC SHA256 signature
    const generateSig = (orderId, paymentId) => {
      return crypto
        .createHmac("sha256", testKeySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");
    };

    const postVerify = async (body) => {
      const response = await fetch(`${baseUrl}/api/donations/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return { status: response.status, body: data };
    };

    // -------------------------------------------------------------------------
    // Test 1: Missing verification fields
    // -------------------------------------------------------------------------
    console.log("Test 1: Request with missing fields...");
    const res1 = await postVerify({ donationId: "650000000000000000000000" });
    if (res1.status === 400 && res1.body.message.includes("missing")) {
      console.log("  [PASS] Server rejected missing verification data with 400.\n");
    } else {
      throw new Error(`Test 1 Failed: Expected 400, got ${res1.status}: ${JSON.stringify(res1.body)}`);
    }

    // -------------------------------------------------------------------------
    // Test 2: Non-existent donation ID
    // -------------------------------------------------------------------------
    console.log("Test 2: Non-existent donation record...");
    const nonExistentId = new mongoose.Types.ObjectId();
    const res2 = await postVerify({
      donationId: nonExistentId.toString(),
      razorpay_order_id: "order_fake_1",
      razorpay_payment_id: "pay_fake_1",
      razorpay_signature: "sig_fake_1",
    });
    if (res2.status === 404 && res2.body.message.includes("Donation not found")) {
      console.log("  [PASS] Server returned 404 for non-existent donation.\n");
    } else {
      throw new Error(`Test 2 Failed: Expected 404, got ${res2.status}: ${JSON.stringify(res2.body)}`);
    }

    // -------------------------------------------------------------------------
    // Test 3: SEC-003 Exploit Attempt: Order ID Substitution
    // -------------------------------------------------------------------------
    console.log("Test 3: Order ID Substitution exploit attempt (SEC-003)...");
    const donationA = await Donation.create({
      name: "Small Donor",
      email: "small@security-test.local",
      phone: "9876543210",
      amount: 1,
      razorpayOrderId: "order_A_valid_1",
      paymentStatus: "pending",
    });

    const donationB = await Donation.create({
      name: "Big Exploiter",
      email: "exploit@security-test.local",
      phone: "9876543211",
      amount: 100000,
      razorpayOrderId: "order_B_valid_100000",
      paymentStatus: "pending",
    });

    // Attacker pays ₹1 for Order A, obtains payment ID and valid signature for Order A
    const paymentIdA = "pay_legit_order_a_1";
    const signatureA = generateSig(donationA.razorpayOrderId, paymentIdA);

    // Attacker now tries to verify Big Donation B using Order A's signature and order ID!
    const res3 = await postVerify({
      donationId: donationB._id.toString(),
      razorpay_order_id: donationA.razorpayOrderId, // MISMATCH!
      razorpay_payment_id: paymentIdA,
      razorpay_signature: signatureA,
    });

    const refreshedDonationB = await Donation.findById(donationB._id);

    if (
      res3.status === 400 &&
      res3.body.message.includes("Order ID mismatch") &&
      refreshedDonationB.paymentStatus !== "success"
    ) {
      console.log("  [PASS] Order ID mismatch blocked! Status 400 returned, donation not approved.\n");
    } else {
      throw new Error(`Test 3 Failed: Order ID substitution was not blocked! Status: ${res3.status}: ${JSON.stringify(res3.body)}`);
    }

    // -------------------------------------------------------------------------
    // Test 4: Invalid signature detection
    // -------------------------------------------------------------------------
    console.log("Test 4: Invalid signature rejection...");
    const res4 = await postVerify({
      donationId: donationA._id.toString(),
      razorpay_order_id: donationA.razorpayOrderId,
      razorpay_payment_id: "pay_tampered_1",
      razorpay_signature: "invalid_tampered_signature_hex_value_1234567890abcdef",
    });

    const refreshedDonationA = await Donation.findById(donationA._id);

    if (
      res4.status === 400 &&
      res4.body.message.includes("Invalid signature") &&
      refreshedDonationA.paymentStatus === "failed"
    ) {
      console.log("  [PASS] Tampered signature rejected with 400 and status set to 'failed'.\n");
    } else {
      throw new Error(`Test 4 Failed: Expected signature failure, got ${res4.status}`);
    }

    // -------------------------------------------------------------------------
    // Test 5: Valid verification flow
    // -------------------------------------------------------------------------
    console.log("Test 5: Legitimate payment verification flow...");
    const donationValid = await Donation.create({
      name: "Legit Donor",
      email: "legit@security-test.local",
      phone: "9876543212",
      amount: 501,
      razorpayOrderId: "order_legit_501",
      paymentStatus: "pending",
    });

    const legitPaymentId = "pay_legit_501_ok";
    const legitSignature = generateSig(donationValid.razorpayOrderId, legitPaymentId);

    const res5 = await postVerify({
      donationId: donationValid._id.toString(),
      razorpay_order_id: donationValid.razorpayOrderId,
      razorpay_payment_id: legitPaymentId,
      razorpay_signature: legitSignature,
    });

    const verifiedDonation = await Donation.findById(donationValid._id);

    if (
      res5.status === 200 &&
      res5.body.status === "success" &&
      verifiedDonation.paymentStatus === "success" &&
      verifiedDonation.razorpayPaymentId === legitPaymentId
    ) {
      console.log("  [PASS] Legitimate donation successfully verified and marked 'success'.\n");
    } else {
      throw new Error(`Test 5 Failed: Expected 200 success, got ${res5.status}: ${JSON.stringify(res5.body)}`);
    }

    // -------------------------------------------------------------------------
    // Test 6: Replay attack prevention (re-verifying already successful donation)
    // -------------------------------------------------------------------------
    console.log("Test 6: Replay attack on already successful donation...");
    const res6 = await postVerify({
      donationId: donationValid._id.toString(),
      razorpay_order_id: donationValid.razorpayOrderId,
      razorpay_payment_id: legitPaymentId,
      razorpay_signature: legitSignature,
    });

    if (res6.status === 400 && res6.body.message.includes("already been verified")) {
      console.log("  [PASS] Replay on already-verified donation rejected with 400.\n");
    } else {
      throw new Error(`Test 6 Failed: Expected 400 already verified, got ${res6.status}`);
    }

    // -------------------------------------------------------------------------
    // Test 7: Replay attack across different donations (duplicate payment ID)
    // -------------------------------------------------------------------------
    console.log("Test 7: Cross-donation payment ID replay prevention...");
    const donationReplayTarget = await Donation.create({
      name: "Replay Target",
      email: "replay@security-test.local",
      phone: "9876543213",
      amount: 1000,
      razorpayOrderId: "order_replay_1000",
      paymentStatus: "pending",
    });

    // Try to reuse legitPaymentId from Test 5 with matching order ID signature
    const replaySig = generateSig(donationReplayTarget.razorpayOrderId, legitPaymentId);

    const res7 = await postVerify({
      donationId: donationReplayTarget._id.toString(),
      razorpay_order_id: donationReplayTarget.razorpayOrderId,
      razorpay_payment_id: legitPaymentId, // Already used in donationValid!
      razorpay_signature: replaySig,
    });

    if (res7.status === 400 && res7.body.message.includes("already been utilized")) {
      console.log("  [PASS] Reusing payment ID across donations rejected with 400.\n");
    } else {
      throw new Error(`Test 7 Failed: Expected 400 duplicate payment id, got ${res7.status}`);
    }

    // -------------------------------------------------------------------------
    // Test 8: Database Unique Index on razorpayPaymentId
    // -------------------------------------------------------------------------
    console.log("Test 8: Database sparse unique index check...");
    let uniqueIndexEnforced = false;
    try {
      await Donation.syncIndexes();
      await Donation.create({
        name: "Index Test Duplicate",
        email: "duplicate@security-test.local",
        phone: "9876543214",
        amount: 50,
        razorpayPaymentId: legitPaymentId,
      });
    } catch (err) {
      if (err.code === 11000 || err.message.includes("duplicate key")) {
        uniqueIndexEnforced = true;
      }
    }

    if (uniqueIndexEnforced) {
      console.log("  [PASS] Database level duplicate razorpayPaymentId rejected with E11000.\n");
    } else {
      throw new Error("Test 8 Failed: Unique index did not reject duplicate payment ID");
    }

    // Clean up
    await Donation.deleteMany({ email: /@security-test\.local$/ });
    if (server) server.close();
    await mongoose.disconnect();

    console.log("=================================================");
    console.log("ALL SEC-003 VERIFICATION TESTS PASSED SUCCESSFULLY!");
    console.log("=================================================");
  } catch (error) {
    console.error("\nTEST SUITE FAILED:", error);
    try {
      await Donation.deleteMany({ email: /@security-test\.local$/ });
      if (server) server.close();
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
}

runTests();
