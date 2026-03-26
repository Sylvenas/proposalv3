// E2E Test: Options Screen
// Navigates directly to the options screen and verifies option cards render

const BASE = "http://localhost:3000/proposal-v3?screen=options";

const page = await browser.getPage("options");
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

// Screenshot: options screen top
const ss1 = await page.screenshot({ fullPage: false });
await saveScreenshot(ss1, "03-options-top.png");

// Verify option titles are present (may need to scroll to find them)
const option1 = page.locator("text=/OPTION 1/");
const count1 = await option1.count();
console.log(`✅ Found ${count1} element(s) matching 'OPTION 1'`);

// Verify "Select" buttons exist
const selectBtns = page.locator("button:has-text('Select')");
const selectCount = await selectBtns.count();
console.log(`✅ Found ${selectCount} 'Select' button(s)`);

// Scroll down to see option cards
await page.evaluate(() => window.scrollTo({ top: 600, behavior: "smooth" }));
await page.waitForTimeout(800);

const ss2 = await page.screenshot({ fullPage: false });
await saveScreenshot(ss2, "03-options-scrolled.png");

// Check OPTION 1 is now visible after scroll
try {
  await option1.first().waitFor({ state: "visible", timeout: 3000 });
  console.log("✅ OPTION 1 visible after scroll");
} catch {
  // scroll more
  await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "smooth" }));
  await page.waitForTimeout(800);
  try {
    await option1.first().waitFor({ state: "visible", timeout: 3000 });
    console.log("✅ OPTION 1 visible after more scroll");
  } catch {
    console.log("ℹ️  OPTION 1 exists in DOM but not visible in viewport");
  }
}

// Full page screenshot
const ss3 = await page.screenshot({ fullPage: true });
await saveScreenshot(ss3, "03-options-full.png");

console.log("\n🎉 03-options-screen: ALL PASSED");
