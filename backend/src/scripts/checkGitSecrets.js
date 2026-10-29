import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("==================================================");
console.log("SEC-007: GIT SECRETS & ENVIRONMENT AUDIT CHECK");
console.log("==================================================\n");

let passed = true;

// 1. Verify that .env is ignored across the repository
console.log("[CHECK 1] Verifying .gitignore covers all .env and secret files...");
const envFilesToCheck = [
  "backend/.env",
  "frontend/.env",
  "admin/.env",
  ".env",
  ".env.local",
  ".env.production",
  "backend/server.key",
  "serviceAccountKey.json",
];

for (const file of envFilesToCheck) {
  try {
    const ignored = execSync(`git check-ignore "${file}"`, { encoding: "utf8" }).trim();
    if (ignored) {
      console.log(`  [OK] ${file} is properly ignored by .gitignore`);
    }
  } catch (err) {
    console.error(`  [FAIL] ${file} is NOT ignored by .gitignore!`);
    passed = false;
  }
}

// 2. Verify that NO .env or secret files are currently tracked in Git index
console.log("\n[CHECK 2] Verifying no secret files are currently tracked in Git index...");
try {
  const trackedFiles = execSync("git ls-files", { encoding: "utf8" }).split("\n");
  const sensitivePatterns = [
    /\.env$/i,
    /\.env\.(?!example)/i,
    /\.pem$/i,
    /\.key$/i,
    /id_rsa/i,
    /serviceAccountKey.*\.json$/i,
  ];

  let trackedSecrets = [];
  for (const file of trackedFiles) {
    const trimmed = file.trim();
    if (!trimmed) continue;
    for (const pattern of sensitivePatterns) {
      if (pattern.test(trimmed)) {
        trackedSecrets.push(trimmed);
      }
    }
  }

  if (trackedSecrets.length === 0) {
    console.log("  [OK] Zero sensitive configuration files are tracked in the current Git index.");
  } else {
    console.error("  [FAIL] Tracked secrets found in Git index:", trackedSecrets);
    passed = false;
  }
} catch (err) {
  console.error("  [ERROR] Failed to list git files:", err.message);
  passed = false;
}

// 3. Verify that .env.example files exist and contain NO live credentials
console.log("\n[CHECK 3] Verifying .env.example files are clean templates...");
const exampleFiles = [
  "backend/.env.example",
  "frontend/.env.example",
  "admin/.env.example",
];

for (const relPath of exampleFiles) {
  const fullPath = path.resolve("..", relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`  [FAIL] Missing template: ${relPath}`);
    passed = false;
    continue;
  }
  const content = fs.readFileSync(fullPath, "utf8");

  const hasLiveSecret =
    content.includes("mongodb+srv://admin:") ||
    content.includes("mongodb+srv://sahil:") ||
    (content.includes("@cluster0.") && !content.includes("example.mongodb.net")) ||
    (/CLOUDINARY_API_SECRET=[a-zA-Z0-9_-]{15,}/.test(content) && !content.includes("your_api_secret")) ||
    (/RAZORPAY_KEY_SECRET=[a-zA-Z0-9_-]{15,}/.test(content) && !content.includes("your_razorpay_key_secret"));

  if (hasLiveSecret) {
    console.error(`  [FAIL] Live secret detected in template: ${relPath}`);
    passed = false;
  } else {
    console.log(`  [OK] ${relPath} is present and verified sanitized.`);
  }
}

// 4. Historical Secret Exposure Assessment (SEC-007)
console.log("\n[CHECK 4] Scanning Git commit history for historical secret exposure...");
try {
  const historyLog = execSync('git log --oneline -- "**/.*env*" ".*env*"', {
    encoding: "utf8",
  }).trim();
  if (historyLog) {
    console.log("  [AUDIT NOTE] Historical commits containing .env modifications:");
    console.log("  " + historyLog.split("\n").join("\n  "));
    console.log("\n  ⚠️  Commit 74c93bd previously committed backend/.env before deletion.");
    console.log("  Mandatory Action Required: Rotate all credentials exposed in 74c93bd.");
  } else {
    console.log("  [OK] No historical .env commits detected.");
  }
} catch (err) {
  console.warn("  [WARN] History scan encountered an issue:", err.message);
}

console.log("\n==================================================");
if (passed) {
  console.log("ALL GIT REPOSITORY SECRET PREVENTATIVE CHECKS PASSED! ✅");
} else {
  console.error("GIT SECRETS CHECK FAILED! ❌");
  process.exit(1);
}
console.log("==================================================");
