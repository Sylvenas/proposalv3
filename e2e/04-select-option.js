// E2E Test: Select an option → navigate to Detail screen
// Clicks the first "Select" button and verifies the detail screen loads

const BASE = "http://localhost:3000/proposal-v3?screen=options";

const page = await browser.getPage("select-option");
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

// Click the first "Select" button
const selectBtn = page.locator("button:has-text('Select')").first();
await selectBtn.waitFor({ state: "visible", timeout: 5000 });
await selectBtn.click();
console.log("Clicked first 'Select' button");
await page.waitForTimeout(500);

// Verify we transitioned to detail screen
const url = page.url();
console.log("Current URL:", url);
if (url.includes("screen=detail")) {
  console.log("✅ URL contains screen=detail");
}

// Verify detail screen content — "Sign & Approve" button should exist
const signBtn = page.locator("button:has-text('Sign')");
await signBtn.first().waitFor({ state: "visible", timeout: 5000 });
console.log("✅ 'Sign & Approve' button visible on detail screen");

// Verify product sections are visible (fence parts, gate, hardware etc.)
const fenceParts = page.locator("text=Fence Parts");
await fenceParts.first().waitFor({ state: "visible", timeout: 5000 });
console.log("✅ 'Fence Parts' section visible");

// Screenshot: detail screen
const ss = await page.screenshot({ fullPage: false });
await saveScreenshot(ss, "04-detail-screen.png");

// Scroll down to see more product details
await page.evaluate(() => window.scrollTo({ top: 600, behavior: "smooth" }));
await page.waitForTimeout(800);

const ss2 = await page.screenshot({ fullPage: false });
await saveScreenshot(ss2, "04-detail-scrolled.png");

console.log("\n🎉 04-select-option: ALL PASSED");
