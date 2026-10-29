import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "../app.js";

async function runTests() {
  console.log("==================================================");
  console.log("SEC-010: HTTP SECURITY HEADERS & CORS VERIFICATION");
  console.log("==================================================\n");

  let server;

  try {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    // -------------------------------------------------------------------------
    // TEST 1: Helmet HTTP Security Headers Presence
    // -------------------------------------------------------------------------
    console.log("[TEST 1] Testing HTTP security headers on GET /api/health...");
    const res = await fetch(`${baseUrl}/api/health`);
    const headers = res.headers;

    const xContentType = headers.get("x-content-type-options");
    const xFrameOptions = headers.get("x-frame-options");
    const corp = headers.get("cross-origin-resource-policy");

    console.log("  Headers received:");
    console.log(`    x-content-type-options: ${xContentType}`);
    console.log(`    x-frame-options: ${xFrameOptions}`);
    console.log(`    cross-origin-resource-policy: ${corp}`);

    if (xContentType === "nosniff" && xFrameOptions && corp === "cross-origin") {
      console.log("  [PASS] Essential Helmet security headers verified.\n");
    } else {
      throw new Error(`Test 1 Failed: Missing expected security headers. Got: ${JSON.stringify(Object.fromEntries(headers.entries()))}`);
    }

    // -------------------------------------------------------------------------
    // TEST 2: CORS Development Mode Permitted Origin
    // -------------------------------------------------------------------------
    console.log("[TEST 2] Testing CORS with allowed origin (http://localhost:5173)...");
    const devRes = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: "http://localhost:5173" },
    });
    const devAcao = devRes.headers.get("access-control-allow-origin");
    if (devAcao === "http://localhost:5173") {
      console.log(`  [PASS] Allowed dev origin successfully authorized (ACAO: ${devAcao}).\n`);
    } else {
      throw new Error(`Test 2 Failed: Expected http://localhost:5173 to be allowed, got: ${devAcao}`);
    }

    // -------------------------------------------------------------------------
    // TEST 3: CORS Unauthorized Origin Blocked
    // -------------------------------------------------------------------------
    console.log("[TEST 3] Testing CORS with unauthorized origin (https://malicious-site.evil)...");
    const evilRes = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: "https://malicious-site.evil" },
    });
    const evilAcao = evilRes.headers.get("access-control-allow-origin");
    if (!evilAcao) {
      console.log("  [PASS] Unauthorized origin blocked: No Access-Control-Allow-Origin header returned.\n");
    } else {
      throw new Error(`Test 3 Failed: Unauthorized origin was permitted with ACAO: ${evilAcao}`);
    }

    server.close();

    console.log("==================================================");
    console.log("ALL SEC-010 HEADERS & CORS TESTS PASSED! ✅");
    console.log("==================================================");
  } catch (err) {
    console.error("\nTEST SUITE FAILED:", err);
    if (server) server.close();
    process.exit(1);
  }
}

runTests();

