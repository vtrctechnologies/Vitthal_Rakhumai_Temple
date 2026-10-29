import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import http from "http";
import app from "../app.js";
import User from "../modules/auth/user.model.js";
import { Registration } from "../modules/sports/registration.model.js";
import { Sport } from "../modules/sports/sport.model.js";
import generateToken from "../shared/utils/generateToken.js";

async function runTests() {
  console.log("==================================================");
  console.log("SEC-011: CSV / FORMULA INJECTION VERIFICATION");
  console.log("==================================================\n");

  let server;
  let adminUser;
  let testSport;
  let testReg1;
  let testReg2;

  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB for CSV injection tests.\n");

    // Create an admin user to authorize the export request
    adminUser = await User.create({
      name: "CSV Admin",
      email: `csv_admin_${Date.now()}@vrtemple-test.com`,
      password: "AdminPassword123!",
      role: "admin",
    });

    const adminToken = generateToken(adminUser._id);

    // Create a test competition / sport
    testSport = await Sport.create({
      name: "Cricket Tournament",
      title: "Vitthal Cup 2026",
      year: 2026,
    });

    // Insert registration records containing dangerous formula injection payloads
    testReg1 = await Registration.create({
      sport: testSport._id,
      sportName: testSport.name,
      participantName: "=cmd|' /C calc'!A0",
      teamName: "+1+2",
      mobile: "9988776655",
      email: "testformula1@security.local",
      villageOrCity: "-5*10",
      notes: "@SUM(1,99)",
      status: "confirmed",
    });

    testReg2 = await Registration.create({
      sport: testSport._id,
      sportName: testSport.name,
      participantName: "Legit Player Name",
      teamName: "Legit Team",
      mobile: "9988776656",
      email: "legit@security.local",
      villageOrCity: "Pune",
      notes: "Regular non-formula notes",
      status: "confirmed",
    });

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    console.log("[TEST 1] Fetching exported CSV as authorized administrator...");
    const res = await fetch(`${baseUrl}/api/sports/admin/registrations/export`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (res.status !== 200) {
      throw new Error(`Failed to fetch CSV: Status ${res.status}`);
    }

    const csvText = await res.text();
    console.log("  Received CSV response successfully.\n");

    // -------------------------------------------------------------------------
    // TEST 2: Validate Formula Neutralization
    // -------------------------------------------------------------------------
    console.log("[TEST 2] Checking that formula injection payloads are neutralized...");

    const lines = csvText.split("\n");
    const formulaLine = lines.find((l) => l.includes("testformula1@security.local"));

    if (!formulaLine) {
      throw new Error("Test record not found in exported CSV!");
    }

    console.log("  Exported payload line:\n    " + formulaLine);

    // Assert that '=cmd', '+1+2', '-5*10', and '@SUM' are escaped with single quote
    const hasEscapedEquals = formulaLine.includes("\"'=cmd|' /C calc'!A0\"");
    const hasEscapedPlus = formulaLine.includes("\"'+1+2\"");
    const hasEscapedMinus = formulaLine.includes("\"'-5*10\"");
    const hasEscapedAt = formulaLine.includes("\"'@SUM(1,99)\"");

    console.log(`\n    Escaped '=': ${hasEscapedEquals}`);
    console.log(`    Escaped '+': ${hasEscapedPlus}`);
    console.log(`    Escaped '-': ${hasEscapedMinus}`);
    console.log(`    Escaped '@': ${hasEscapedAt}`);

    if (hasEscapedEquals && hasEscapedPlus && hasEscapedMinus && hasEscapedAt) {
      console.log("  [PASS] All formula triggers (=, +, -, @) were successfully prefixed with single quotes!\n");
    } else {
      throw new Error("Test 2 Failed: Formula payloads were NOT properly escaped in CSV output!");
    }

    // -------------------------------------------------------------------------
    // TEST 3: Validate Normal Text is Not Unnecessarily Mangled
    // -------------------------------------------------------------------------
    console.log("[TEST 3] Checking that legitimate safe text is preserved cleanly...");
    const legitLine = lines.find((l) => l.includes("legit@security.local"));

    if (!legitLine) {
      throw new Error("Legitimate record not found in exported CSV!");
    }

    console.log("  Exported legitimate line:\n    " + legitLine);

    const hasCleanName = legitLine.includes('"Legit Player Name"');
    const hasCleanCity = legitLine.includes('"Pune"');

    if (hasCleanName && hasCleanCity) {
      console.log("  [PASS] Legitimate safe fields remain clean without leading single quotes.\n");
    } else {
      throw new Error("Test 3 Failed: Normal fields were unexpectedly altered!");
    }

    // Cleanup
    await User.findByIdAndDelete(adminUser._id);
    if (testSport) await Sport.findByIdAndDelete(testSport._id);
    await Registration.deleteMany({ email: /@security\.local$/ });
    server.close();
    await mongoose.disconnect();

    console.log("==================================================");
    console.log("ALL SEC-011 FORMULA INJECTION TESTS PASSED! ✅");
    console.log("==================================================");
  } catch (err) {
    console.error("\nTEST SUITE FAILED:", err);
    if (adminUser) await User.findByIdAndDelete(adminUser._id).catch(() => {});
    if (testSport) await Sport.findByIdAndDelete(testSport._id).catch(() => {});
    await Registration.deleteMany({ email: /@security\.local$/ }).catch(() => {});
    if (server) server.close();
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
}

runTests();
