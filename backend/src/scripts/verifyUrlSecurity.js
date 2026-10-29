import { isSafeUrl } from "../../../frontend/src/utils/urlSecurity.js";

async function runTests() {
  console.log("==================================================");
  console.log("SEC-016: PSEUDO-PROTOCOL & URL SECURITY VERIFICATION");
  console.log("==================================================\n");

  const dangerousUrls = [
    "javascript:alert(document.domain)",
    "JAVASCRIPT:alert(1)",
    "javascript:/*--></title></style></textarea><em><script>alert(1)</script>*/",
    "  javascript:alert('xss')  ",
    "data:text/html,<script>alert(1)</script>",
    "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
    "file://C:/Windows/win.ini",
    "blob:https://example.com/uuid",
    "about:blank",
    "",
    "   ",
    null,
    undefined,
    12345,
    "//example.com/evil", // Protocol-relative link
    "mailto:victim@example.com",
    "tel:9988776655",
  ];

  console.log("[TEST 1] Testing rejection of dangerous pseudo-protocols and invalid inputs...");
  for (const url of dangerousUrls) {
    if (isSafeUrl(url)) {
      throw new Error(`SECURITY VIOLATION: Unsafe URL was permitted: "${url}"`);
    }
  }
  console.log(`  ✓ Successfully rejected all ${dangerousUrls.length} malicious / pseudo-protocol URL patterns.\n`);

  const legitimateUrls = [
    "https://www.youtube.com/@VitthalRakhumaiAmberkarwadi",
    "https://instagram.com/vitthal_rakhumai",
    "https://facebook.com/temple_live",
    "https://vrtemple.org/programs/live",
    "http://localhost:5173/events",
    "http://example.com/darshan",
    "https://twitter.com/temple",
  ];

  console.log("[TEST 2] Testing validation of legitimate HTTPS / HTTP URLs...");
  for (const url of legitimateUrls) {
    if (!isSafeUrl(url)) {
      throw new Error(`FAIL: Legitimate URL was falsely rejected: "${url}"`);
    }
  }
  console.log(`  ✓ Successfully validated all ${legitimateUrls.length} legitimate external URLs.\n`);

  console.log("==================================================");
  console.log("ALL SEC-016 URL SECURITY TESTS PASSED! (2/2)");
  console.log("==================================================");
}

runTests().catch((err) => {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
});
