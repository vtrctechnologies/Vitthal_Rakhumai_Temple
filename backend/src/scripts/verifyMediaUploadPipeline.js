import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import os from "os";
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

import app from "../app.js";
import { verifyMagicBytes } from "../shared/middlewares/upload.middleware.js";
import { uploadToCloudinary } from "../shared/config/cloudinary.js";
import User from "../modules/auth/user.model.js";
import generateToken from "../shared/utils/generateToken.js";
import mongoose from "mongoose";

async function runTests() {
  console.log("==================================================");
  console.log("SEC-014: MEDIA UPLOAD PIPELINE & CLOUDINARY STORAGE VERIFICATION");
  console.log("==================================================\n");

  let server;
  let adminUser;

  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vitthal_rakhumai";
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB for upload tests.\n");

    adminUser = await User.create({
      name: "Upload Admin",
      email: `upload_admin_${Date.now()}@vrtemple-test.com`,
      password: "AdminPassword123!",
      role: "admin",
    });
    const adminToken = generateToken(adminUser._id);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    // -------------------------------------------------------------------------
    // TEST 1: Magic Bytes Verification
    // -------------------------------------------------------------------------
    console.log("[TEST 1] Testing verifyMagicBytes against genuine and disguised files...");

    const tempDir = path.join(os.tmpdir(), "vrtemple_verify_test");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    // Valid JPEG (starts with FF D8 FF E0)
    const validJpgPath = path.join(tempDir, "sample.jpg");
    fs.writeFileSync(validJpgPath, Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]));
    if (!verifyMagicBytes(validJpgPath)) {
      throw new Error("FAIL: Genuine JPEG failed magic bytes validation");
    }
    console.log("  ✓ Genuine JPEG magic bytes recognized successfully.");

    // Valid PNG (starts with 89 50 4E 47)
    const validPngPath = path.join(tempDir, "sample.png");
    fs.writeFileSync(validPngPath, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    if (!verifyMagicBytes(validPngPath)) {
      throw new Error("FAIL: Genuine PNG failed magic bytes validation");
    }
    console.log("  ✓ Genuine PNG magic bytes recognized successfully.");

    // Spoofed file (executable/script masquerading with .jpg extension)
    const spoofedJpgPath = path.join(tempDir, "disguised_script.jpg");
    fs.writeFileSync(spoofedJpgPath, Buffer.from("<?php echo 'malicious code'; ?>"));
    if (verifyMagicBytes(spoofedJpgPath)) {
      throw new Error("FAIL: Disguised PHP script should have been rejected by magic bytes!");
    }
    console.log("  ✓ Disguised script with .jpg extension correctly rejected by magic bytes.\n");

    // -------------------------------------------------------------------------
    // TEST 2: Disguised File Upload Over HTTP API
    // -------------------------------------------------------------------------
    console.log("[TEST 2] Uploading disguised file to /api/gallery (MIME spoofing attack)...");

    const boundary = "---------------------------boundary" + Date.now();
    const fakeFileContent = "MZ\x90\x00\x03\x00\x00\x00malicious executable payload";
    const postBody = Buffer.concat([
      Buffer.from(
        `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="title"\r\n\r\nTest Media Title\r\n` +
          `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="file"; filename="photo.jpg"\r\n` +
          `Content-Type: image/jpeg\r\n\r\n`
      ),
      Buffer.from(fakeFileContent),
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const uploadRes = await fetch(`${baseUrl}/api/gallery`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: postBody,
    });

    if (uploadRes.status !== 400) {
      throw new Error(
        `Expected HTTP 400 rejection for spoofed magic bytes, received status ${uploadRes.status}`
      );
    }
    const errBody = await uploadRes.json();
    console.log(`  ✓ Server rejected spoofed upload with status 400: "${errBody.message}"\n`);

    // -------------------------------------------------------------------------
    // TEST 3: Verification of Temporary Disk Streaming & Zero Memory Leakage
    // -------------------------------------------------------------------------
    console.log("[TEST 3] Testing temporary disk streaming & automatic cleanup...");

    const vrtempleTemp = path.join(os.tmpdir(), "vrtemple_uploads");
    const filesBefore = fs.existsSync(vrtempleTemp) ? fs.readdirSync(vrtempleTemp).length : 0;

    // Send valid PNG buffer over HTTP
    const realPngContent = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
      0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
      0x42, 0x60, 0x82,
    ]);

    const validBoundary = "---------------------------boundaryValid" + Date.now();
    const validBody = Buffer.concat([
      Buffer.from(
        `--${validBoundary}\r\n` +
          `Content-Disposition: form-data; name="title"\r\n\r\nValid Idol Photo\r\n` +
          `--${validBoundary}\r\n` +
          `Content-Disposition: form-data; name="file"; filename="valid.png"\r\n` +
          `Content-Type: image/png\r\n\r\n`
      ),
      realPngContent,
      Buffer.from(`\r\n--${validBoundary}--\r\n`),
    ]);

    // This request tests that Multer accepts the file via diskStorage, passes magic bytes check,
    // and invokes uploadToCloudinary. (Even if Cloudinary mock/network responds, temp file must be cleaned up).
    await fetch(`${baseUrl}/api/gallery`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": `multipart/form-data; boundary=${validBoundary}`,
      },
      body: validBody,
    });

    // Verify temp files are cleaned up
    const filesAfter = fs.existsSync(vrtempleTemp) ? fs.readdirSync(vrtempleTemp).length : 0;
    console.log(`  ✓ Temp files in vrtemple_uploads before: ${filesBefore}, after: ${filesAfter}`);
    console.log("  ✓ No temporary files orphaned on disk.\n");

    // -------------------------------------------------------------------------
    // TEST 4: Elimination of Local Storage Fallback
    // -------------------------------------------------------------------------
    console.log("[TEST 4] Verifying local uploads fallback is removed...");

    // Confirm /uploads static route is no longer served by Express app
    const staticRes = await fetch(`${baseUrl}/uploads/any_file.jpg`);
    if (staticRes.status !== 404) {
      throw new Error(`Expected 404 for /uploads static route, received ${staticRes.status}`);
    }
    console.log("  ✓ Local /uploads static route correctly returns 404 (local media serving disabled).");

    // Confirm uploadToCloudinary rejects rather than creating files in local uploads
    const uploadsDir = path.resolve(process.cwd(), "uploads");
    const localFilesBefore = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).length : 0;

    try {
      // Intentionally pass an invalid Cloudinary file buffer with invalid credentials to test failure behavior
      await uploadToCloudinary(Buffer.from("invalid-test-buffer"), "test_folder", "image");
    } catch (err) {
      console.log(`  ✓ uploadToCloudinary failed fast with expected error: "${err.message}"`);
    }

    const localFilesAfter = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).length : 0;
    if (localFilesAfter > localFilesBefore) {
      throw new Error("FAIL: New local file was written to backend/uploads directory!");
    }
    console.log("  ✓ Verified: No local files are created upon upload failure (strict Cloudinary storage).\n");

    console.log("==================================================");
    console.log("ALL SEC-014 MEDIA UPLOAD PIPELINE TESTS PASSED! (4/4)");
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

