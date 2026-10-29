import fs from "fs";
import path from "path";
import { deleteFromCloudinary } from "../shared/config/cloudinary.js";

async function runTests() {
  console.log("==================================================");
  console.log("RUNNING SEC-006: PATH TRAVERSAL DELETION TESTS");
  console.log("==================================================");

  try {
    const packageJsonPath = path.resolve(process.cwd(), "package.json");
    const serverJsPath = path.resolve(process.cwd(), "src/server.js");

    if (!fs.existsSync(packageJsonPath)) {
      throw new Error("Pre-condition failed: package.json missing");
    }
    if (!fs.existsSync(serverJsPath)) {
      throw new Error("Pre-condition failed: src/server.js missing");
    }

    // TEST 1: Traversal using unix relative path ../../package.json
    console.log("\n[TEST 1] Attacker attempts to delete package.json via 'local_../../package.json'...");
    const res1 = await deleteFromCloudinary("local_../../package.json");
    console.log("Result 1:", res1);
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error("CRITICAL VULNERABILITY: package.json was deleted!");
    }
    if (res1.result !== "error") {
      throw new Error(`FAIL: Expected error result, got ${JSON.stringify(res1)}`);
    }
    console.log("PASS: Traversal blocked. package.json is safe!");

    // TEST 2: Traversal using Windows relative path ..\..\src\server.js
    console.log("\n[TEST 2] Attacker attempts to delete src/server.js via 'local_..\\..\\src\\server.js'...");
    const res2 = await deleteFromCloudinary("local_..\\..\\src\\server.js");
    console.log("Result 2:", res2);
    if (!fs.existsSync(serverJsPath)) {
      throw new Error("CRITICAL VULNERABILITY: src/server.js was deleted!");
    }
    if (res2.result !== "error") {
      throw new Error(`FAIL: Expected error result, got ${JSON.stringify(res2)}`);
    }
    console.log("PASS: Traversal blocked. src/server.js is safe!");

    // TEST 3: Attacker attempts to delete the uploads directory itself via 'local_'
    console.log("\n[TEST 3] Attacker passes empty filename 'local_' to target uploads root...");
    const res3 = await deleteFromCloudinary("local_");
    console.log("Result 3:", res3);
    const uploadsDir = path.resolve(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      throw new Error("CRITICAL VULNERABILITY: uploads directory was deleted!");
    }
    console.log("PASS: Root directory deletion blocked.");

    // TEST 4: Legitimate file deletion within uploads directory
    console.log("\n[TEST 4] Testing legitimate file deletion within uploads directory...");
    const dummyFilename = `test_legit_${Date.now()}.jpg`;
    const dummyFilepath = path.join(uploadsDir, dummyFilename);
    fs.writeFileSync(dummyFilepath, Buffer.from("dummy test content"));

    if (!fs.existsSync(dummyFilepath)) {
      throw new Error("Failed to create dummy file for test 4");
    }

    const res4 = await deleteFromCloudinary(`local_${dummyFilename}`);
    console.log("Result 4:", res4);

    if (fs.existsSync(dummyFilepath)) {
      throw new Error("FAIL: Legitimate file was not deleted!");
    }
    if (res4.result !== "ok") {
      throw new Error(`FAIL: Expected ok result, got ${JSON.stringify(res4)}`);
    }
    console.log("PASS: Legitimate file inside uploads was safely deleted.");

    console.log("\n==================================================");
    console.log("ALL PATH TRAVERSAL SECURITY TESTS PASSED! ✅");
    console.log("==================================================");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    process.exitCode = 1;
  }
}

runTests();

