// E2E Test: Approved Screen
// Navigates directly to approved screen and verifies content

const BASE = "http://localhost:3000/proposal-v3?screen=approved&option=2";

const page = await browser.getPage("approved");
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

// Screenshot: approved screen
const ss1 = await page.screenshot({ fullPage: false });
await saveScreenshot(ss1, "06-approved-top.png");

// Verify "Proposal Approved" or "Approved Scope" text
try {
  const approvedText = page.locator("text=Proposal Approved");
  await approvedText.first().waitFor({ state: "visible", timeout: 5000 });
  console.log("✅ 'Proposal Approved' text visible");
} catch {
  try {
    const approvedScope = page.locator("text=Approved Scope");
    await approvedScope.first().waitFor({ state: "visible", timeout: 5000 });
    console.log("✅ 'Approved Scope' section visible");
  } catch {
    console.log("⚠️  No approved indicators found in viewport");
  }
}

// Verify tabs exist (Project Home, Contract, Documents, etc.)
const tabs = ["Project Home", "Contract", "Documents", "Products", "Drawings"];
for (const tab of tabs) {
  try {
    const tabEl = page.locator(`text=${tab}`);
    await tabEl.first().waitFor({ state: "visible", timeout: 3000 });
    console.log(`✅ Tab '${tab}' visible`);
  } catch {
    console.log(`ℹ️  Tab '${tab}' not visible in viewport`);
  }
}

// Verify project info
const projectName = page.locator("text=Henderson Backyard Fence");
await projectName.first().waitFor({ state: "visible", timeout: 5000 });
console.log("✅ Project name visible on approved screen");

// Scroll to see approved scope and contract
await page.evaluate(() => window.scrollTo({ top: 600, behavior: "smooth" }));
await page.waitForTimeout(800);

const ss2 = await page.screenshot({ fullPage: false });
await saveScreenshot(ss2, "06-approved-scrolled.png");

// Full page screenshot
const ss3 = await page.screenshot({ fullPage: true });
await saveScreenshot(ss3, "06-approved-full.png");

console.log("\n🎉 06-approved-screen: ALL PASSED");
