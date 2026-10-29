import dotenv from "dotenv";
import path from "path";
import http from "http";
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
import app from "../app.js";
import User from "../modules/auth/user.model.js";

async function runTests() {
  console.log("==================================================");
  console.log("SEC-015: HTTPONLY COOKIE AUTHENTICATION VERIFICATION");
  console.log("==================================================\n");

  let server;
  let adminUser;

  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vitthal_rakhumai";
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB for auth verification.\n");

    const testPassword = "AdminSecurePassword123!";
    adminUser = await User.create({
      name: "Cookie Admin",
      email: `cookie_admin_${Date.now()}@vrtemple-test.com`,
      password: testPassword,
      role: "admin",
    });

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    // -------------------------------------------------------------------------
    // TEST 1: Login sets HttpOnly cookie
    // -------------------------------------------------------------------------
    console.log("[TEST 1] Logging in via /api/auth/login and checking Set-Cookie header...");
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: adminUser.email,
        password: testPassword,
      }),
    });

    if (loginRes.status !== 200) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }

    const setCookieHeaders = loginRes.headers.get("set-cookie") || "";
    console.log("  Set-Cookie Header:", setCookieHeaders);

    if (!setCookieHeaders.includes("temple_admin_token=")) {
      throw new Error("FAIL: Set-Cookie header missing temple_admin_token!");
    }
    if (!setCookieHeaders.toLowerCase().includes("httponly")) {
      throw new Error("FAIL: Cookie missing HttpOnly flag! Vulnerable to XSS token theft.");
    }

    console.log("  ✓ Server successfully issued HttpOnly session cookie.\n");

    // Extract raw cookie string to simulate browser sending cookies
    const cookieMatch = setCookieHeaders.match(/(temple_admin_token=[^;]+)/);
    const cookieValue = cookieMatch ? cookieMatch[1] : "";

    // -------------------------------------------------------------------------
    // TEST 2: Authentication via Cookie Only (No Bearer Header)
    // -------------------------------------------------------------------------
    console.log("[TEST 2] Accessing /api/auth/me using ONLY the HttpOnly Cookie (no Authorization header)...");
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Cookie: cookieValue,
      },
    });

    if (meRes.status !== 200) {
      const err = await meRes.text();
      throw new Error(`Expected 200 OK using cookie auth, received ${meRes.status}: ${err}`);
    }

    const meData = await meRes.json();
    if (meData.data._id !== adminUser._id.toString() || meData.data.role !== "admin") {
      throw new Error("Profile returned by cookie auth does not match expected admin!");
    }

    console.log(`  ✓ Authenticated successfully via HttpOnly cookie as: ${meData.data.name} (${meData.data.role})\n`);

    // -------------------------------------------------------------------------
    // TEST 3: Unauthenticated Access Rejection
    // -------------------------------------------------------------------------
    console.log("[TEST 3] Accessing /api/auth/me with no cookie and no header...");
    const unauthRes = await fetch(`${baseUrl}/api/auth/me`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, received ${unauthRes.status}`);
    }
    console.log("  ✓ Correctly rejected with 401 Unauthorized.\n");

    // -------------------------------------------------------------------------
    // TEST 4: Logout Clears HttpOnly Cookie
    // -------------------------------------------------------------------------
    console.log("[TEST 4] Logging out via /api/auth/logout...");
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: cookieValue,
      },
    });

    if (logoutRes.status !== 200) {
      throw new Error(`Logout failed with status ${logoutRes.status}`);
    }

    const logoutCookieHeader = logoutRes.headers.get("set-cookie") || "";
    console.log("  Logout Set-Cookie Header:", logoutCookieHeader);

    if (
      !logoutCookieHeader.includes("temple_admin_token=;") &&
      !logoutCookieHeader.toLowerCase().includes("max-age=0") &&
      !logoutCookieHeader.toLowerCase().includes("expires=")
    ) {
      throw new Error("FAIL: Logout response did not expire the temple_admin_token cookie!");
    }

    console.log("  ✓ Logout endpoint successfully invalidated and cleared session cookie.\n");

    console.log("==================================================");
    console.log("ALL SEC-015 HTTPONLY COOKIE AUTH TESTS PASSED! (4/4)");
    console.log("==================================================");
  } finally {
    if (adminUser) await User.findByIdAndDelete(adminUser._id).catch(() => {});
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect().catch(() => {});
  }
}

runTests().catch((err) => {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
});

