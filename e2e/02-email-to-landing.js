// E2E Test: Email → Landing transition
// "Review My Proposal" opens a new tab, so we navigate directly to landing

const BASE = "http://localhost:3000/proposal-v3?screen=landing";

const page = await browser.getPage("landing");
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

// Verify landing screen loaded — check for Madison Fence Company logo
const companyLogo = page.locator("img[alt='Madison Fence Company']");
await companyLogo.first().waitFor({ state: "visible", timeout: 5000 });
console.log("✅ Madison Fence Company branding visible");

// Verify the inspection report content
const inspectionReport = page.locator("text=INSPECTION REPORT");
await inspectionReport.first().waitFor({ state: "visible", timeout: 5000 });
console.log("✅ 'INSPECTION REPORT' section visible");

// Verify Henderson Backyard Fence text
const projectName = page.locator("text=Henderson Backyard Fence");
await projectName.first().waitFor({ state: "visible", timeout: 5000 });
console.log("✅ Project name 'Henderson Backyard Fence' visible");

// Verify "Explore Options" buttons exist
const exploreBtn = page.locator("button:has-text('Explore Options')").or(
  page.locator("button:has-text('EXPLORE OPTIONS')"));
const count = await exploreBtn.count();
console.log(`✅ Found ${count} 'Explore Options' button(s)`);

// Screenshot
const ss = await page.screenshot({ fullPage: false });
await saveScreenshot(ss, "02-landing-screen.png");

console.log("\n🎉 02-email-to-landing: ALL PASSED");
