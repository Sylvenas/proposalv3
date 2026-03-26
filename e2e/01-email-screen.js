// E2E Test: Email Screen
// Tests the initial Outlook email mockup renders correctly

const BASE = "http://localhost:3000/proposal-v3";

const page = await browser.getPage("email");
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

// Screenshot: email screen
const ss = await page.screenshot({ fullPage: false });
await saveScreenshot(ss, "01-email-screen.png");

// Verify email subject
const subject = page.locator("text=Your project proposal is ready to review");
await subject.waitFor({ state: "visible", timeout: 5000 });
console.log("✅ Email subject visible");

// Verify sender
const sender = page.locator("text=Madison Fence Company");
await sender.first().waitFor({ state: "visible", timeout: 5000 });
console.log("✅ Sender 'Madison Fence Company' visible");

// Verify project info in email body
const project = page.locator("text=Henderson Backyard Fence Replacement");
await project.waitFor({ state: "visible", timeout: 5000 });
console.log("✅ Project name visible");

const preparedBy = page.locator("text=Leslie Cheung");
await preparedBy.first().waitFor({ state: "visible", timeout: 5000 });
console.log("✅ Prepared by 'Leslie Cheung' visible");

const price = page.locator("text=$8,615.00");
await price.waitFor({ state: "visible", timeout: 5000 });
console.log("✅ Starting price '$8,615.00' visible");

// Verify CTA button
const cta = page.locator("button:has-text('Review My Proposal')");
await cta.waitFor({ state: "visible", timeout: 5000 });
console.log("✅ 'Review My Proposal' button visible");

console.log("\n🎉 01-email-screen: ALL PASSED");
