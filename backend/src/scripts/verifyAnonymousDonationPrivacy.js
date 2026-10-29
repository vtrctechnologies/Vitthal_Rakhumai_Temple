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
import Donation from "../modules/donation/donation.model.js";
import generateToken from "../shared/utils/generateToken.js";

async function runTests() {
  console.log("==================================================");
  console.log("SEC-013: ANONYMOUS DONOR PRIVACY VERIFICATION");
  console.log("==================================================\n");

  let server;
  let adminUser;
  let publicDonation;
  let anonDonation;

  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vitthal_rakhumai";
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB for privacy verification tests.\n");

    // 1. Create an admin user for checking authorized admin routes
    adminUser = await User.create({
      name: "Privacy Admin",
      email: `privacy_admin_${Date.now()}@vrtemple-test.com`,
      password: "AdminPassword123!",
      role: "admin",
    });
    const adminToken = generateToken(adminUser._id);

    // 2. Insert test donation records: one public, one anonymous
    const secretDonorName = "Confidential Secret Devotee " + Date.now();
    const publicDonorName = "Public Devotee " + Date.now();

    publicDonation = await Donation.create({
      name: publicDonorName,
      email: "public.donor@security.test",
      phone: "9876543210",
      amount: 25000,
      message: "May Lord Vitthal bless all devotees",
      paymentStatus: "success",
      isAnonymous: false,
    });

    anonDonation = await Donation.create({
      name: secretDonorName,
      email: "anonymous.donor@security.test",
      phone: "9876543211",
      amount: 50000,
      message: "Gupt Daan for temple renovation",
      paymentStatus: "success",
      isAnonymous: true,
    });

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    // -------------------------------------------------------------------------
    // TEST 1: Public Leaderboard Endpoint Anonymity Check
    // -------------------------------------------------------------------------
    console.log("[TEST 1] Fetching public leaderboard (/api/donations/leaderboard)...");
    const res = await fetch(`${baseUrl}/api/donations/leaderboard`);

    if (res.status !== 200) {
      throw new Error(`Failed to fetch leaderboard: status ${res.status}`);
    }

    const rawResponseText = await res.text();
    const responseData = JSON.parse(rawResponseText);

    // CRITICAL SECURITY ASSERTION: The real secret name must NOT appear anywhere in the raw wire response
    if (rawResponseText.includes(secretDonorName)) {
      throw new Error(
        `SECURITY VIOLATION: Secret donor name "${secretDonorName}" leaked in public leaderboard HTTP response!`
      );
    }
    console.log("  ✓ Secret donor name is completely absent from raw JSON payload over the wire.");

    // Find the anonymous donation in the leaderboard array
    const anonItem = responseData.data.leaderboard.find(
      (d) => d._id === anonDonation._id.toString()
    );

    if (!anonItem) {
      throw new Error("Anonymous donation item not found in leaderboard response!");
    }

    if (anonItem.name !== "Anonymous Devotee") {
      throw new Error(
        `Expected anonymous item name to be "Anonymous Devotee", got: "${anonItem.name}"`
      );
    }
    console.log(`  ✓ Anonymous record name properly masked to: "${anonItem.name}"`);
    console.log(`  ✓ isAnonymous flag preserved for frontend badges: ${anonItem.isAnonymous}`);

    // Verify public donation is not masked
    const publicItem = responseData.data.leaderboard.find(
      (d) => d._id === publicDonation._id.toString()
    );
    if (!publicItem || publicItem.name !== publicDonorName) {
      throw new Error("Public donation name was incorrectly modified or missing.");
    }
    console.log(`  ✓ Public donor name preserved correctly: "${publicItem.name}"\n`);

    // -------------------------------------------------------------------------
    // TEST 2: Aggregated Statistics Consistency Check
    // -------------------------------------------------------------------------
    console.log("[TEST 2] Verifying total donation statistics...");
    const stats = responseData.data.stats;
    if (stats.totalDonors < 2 || stats.totalRaised < 75000) {
      throw new Error(`Stats mismatch: totalDonors=${stats.totalDonors}, totalRaised=${stats.totalRaised}`);
    }
    console.log(`  ✓ Stats correctly aggregate both anonymous and public donations (Total Raised: ₹${stats.totalRaised}).\n`);

    // -------------------------------------------------------------------------
    // TEST 3: Admin Endpoint Record Access Check
    // -------------------------------------------------------------------------
    console.log("[TEST 3] Verifying authorized admin endpoint retains auditing details (/api/donations)...");
    const adminRes = await fetch(`${baseUrl}/api/donations`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (adminRes.status !== 200) {
      throw new Error(`Admin donations query failed: status ${adminRes.status}`);
    }

    const adminData = await adminRes.json();
    const adminAnonRecord = adminData.data.donations.find(
      (d) => d._id === anonDonation._id.toString()
    );

    if (!adminAnonRecord) {
      throw new Error("Anonymous donation record missing from admin view.");
    }

    if (adminAnonRecord.name !== secretDonorName) {
      throw new Error(
        "Authorized administrators must retain access to actual donor records for tax/accounting audits."
      );
    }
    console.log(`  ✓ Authorized administrators retain access to real donor details for official receipts/auditing.\n`);

    // -------------------------------------------------------------------------
    // TEST 4: Unauthorized Access to Admin Donations
    // -------------------------------------------------------------------------
    console.log("[TEST 4] Verifying unauthenticated access to /api/donations is rejected...");
    const unauthRes = await fetch(`${baseUrl}/api/donations`);
    if (unauthRes.status !== 401 && unauthRes.status !== 403) {
      throw new Error(`Expected 401/403 for unauthenticated access, received ${unauthRes.status}`);
    }
    console.log(`  ✓ Unauthenticated access to private donor records properly blocked (Status: ${unauthRes.status}).\n`);

    console.log("==================================================");
    console.log("ALL SEC-013 DEVOTEE PRIVACY TESTS PASSED! (4/4)");
    console.log("==================================================");
  } finally {
    if (adminUser) await User.findByIdAndDelete(adminUser._id).catch(() => {});
    if (publicDonation) await Donation.findByIdAndDelete(publicDonation._id).catch(() => {});
    if (anonDonation) await Donation.findByIdAndDelete(anonDonation._id).catch(() => {});

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

