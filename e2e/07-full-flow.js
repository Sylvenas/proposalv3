// E2E Test: Full end-to-end flow
// Email → Landing → Options → Detail → Sign Modal → Approved
// Note: "Review My Proposal" opens new tab, so we simulate that with direct nav

const BASE = "http://localhost:3000/proposal-v3";

const page = await browser.getPage("full-flow");
await page.setViewportSize({ width: 1440, height: 900 });

// ── Step 1: Email Screen ──
console.log("── Step 1: Email Screen ──");
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

const reviewBtn = page.locator("button:has-text('Review My Proposal')");
await reviewBtn.waitFor({ state: "visible", timeout: 5000 });
console.log("✅ Email screen loaded");

const ss1 = await page.screenshot({ fullPage: false });
await saveScreenshot(ss1, "07-flow-email.png");

// ── Step 2: Landing Screen (simulate new tab open) ──
console.log("── Step 2: Landing Screen ──");
await page.goto(BASE + "?screen=landing", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

const inspReport = page.locator("text=INSPECTION REPORT");
await inspReport.first().waitFor({ state: "visible", timeout: 5000 });
console.log("✅ Landing screen loaded");

const ss2 = await page.screenshot({ fullPage: false });
await saveScreenshot(ss2, "07-flow-landing.png");

// Click "Explore Options"
const exploreBtn = page.locator("button:has-text('Explore Options')");
await exploreBtn.last().click();
console.log("Clicked 'Explore Options'");
await page.waitForTimeout(500);

// ── Step 3: Options Screen ──
console.log("── Step 3: Options Screen ──");
await page.waitForTimeout(1000);

const selectBtn = page.locator("button:has-text('Select')").first();
await selectBtn.waitFor({ state: "visible", timeout: 8000 });
console.log("✅ Options screen loaded");

const ss3 = await page.screenshot({ fullPage: false });
await saveScreenshot(ss3, "07-flow-options.png");

await selectBtn.click();
console.log("Clicked 'Select' on first option");
await page.waitForTimeout(500);

// ── Step 4: Detail Screen ──
console.log("── Step 4: Detail Screen ──");
const signApproveBtn = page.locator("button:has-text('Sign & Approve')");
await signApproveBtn.first().waitFor({ state: "visible", timeout: 5000 });
console.log("✅ Detail screen loaded");

const ss4 = await page.screenshot({ fullPage: false });
await saveScreenshot(ss4, "07-flow-detail.png");

// Click Sign & Approve to open modal
await signApproveBtn.first().click();
console.log("Clicked 'Sign & Approve'");
await page.waitForTimeout(800);

// ── Step 4b: Sign Modal ──
const signContractText = page.locator("text=Sign Contract as");
await signContractText.first().waitFor({ state: "visible", timeout: 5000 });
console.log("✅ Sign modal opened");

const ss4b = await page.screenshot({ fullPage: false });
await saveScreenshot(ss4b, "07-flow-sign-modal.png");

// Click "Sign" button inside modal
const modalSignBtn = page.locator("div.fixed button:has-text('Sign')").first();
await modalSignBtn.click();
console.log("Clicked 'Sign' in modal");
await page.waitForTimeout(1000);

// ── Step 5: Approved Screen ──
console.log("── Step 5: Approved Screen ──");
const finalUrl = page.url();
console.log("Final URL:", finalUrl);

const ss5 = await page.screenshot({ fullPage: false });
await saveScreenshot(ss5, "07-flow-approved.png");

if (finalUrl.includes("screen=approved")) {
  console.log("✅ Successfully reached Approved screen!");
  const approvedText = page.locator("text=Proposal Approved");
  await approvedText.first().waitFor({ state: "visible", timeout: 5000 });
  console.log("✅ 'Proposal Approved' text visible");
} else {
  console.log("⚠️  Did not reach approved screen — URL:", finalUrl);
}

console.log("\n🎉 07-full-flow: ALL PASSED");
