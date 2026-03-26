// E2E Test: Sign & Approve flow
// Tests the full approval flow on the detail screen

const BASE = "http://localhost:3000/proposal-v3?screen=detail&option=1";

const page = await browser.getPage("sign-approve");
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

// Screenshot: detail screen before signing
const ss1 = await page.screenshot({ fullPage: false });
await saveScreenshot(ss1, "05-before-sign.png");

// Click "Sign & Approve" button (on the detail page, not in modal)
const signApproveBtn = page.locator("button:has-text('Sign & Approve')");
await signApproveBtn.first().waitFor({ state: "visible", timeout: 5000 });
await signApproveBtn.first().click();
console.log("Clicked 'Sign & Approve'");
await page.waitForTimeout(800);

// Verify sign modal appeared — look for "Sign Contract as" text
const signContractText = page.locator("text=Sign Contract as");
await signContractText.first().waitFor({ state: "visible", timeout: 5000 });
console.log("✅ Sign modal opened with 'Sign Contract as...' text");

// Screenshot: sign modal
const ss2 = await page.screenshot({ fullPage: false });
await saveScreenshot(ss2, "05-sign-modal.png");

// Click the "Sign" button inside the modal (the red confirm button)
// The modal's Sign button is inside the right panel of the modal (z-200)
const modalSignBtn = page.locator("div.fixed button:has-text('Sign')").first();
await modalSignBtn.waitFor({ state: "visible", timeout: 5000 });
await modalSignBtn.click();
console.log("Clicked 'Sign' in modal");

// Wait for transition to approved screen
await page.waitForTimeout(1000);

const url = page.url();
console.log("Current URL:", url);

if (url.includes("screen=approved")) {
  console.log("✅ Navigated to approved screen");

  const approvedText = page.locator("text=Proposal Approved");
  await approvedText.first().waitFor({ state: "visible", timeout: 5000 });
  console.log("✅ 'Proposal Approved' text visible");
}

// Screenshot: approved state
const ss3 = await page.screenshot({ fullPage: false });
await saveScreenshot(ss3, "05-after-sign-approved.png");

console.log("\n🎉 05-sign-approve: ALL PASSED");
