const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runTestSuite(urlLabel, url, takeMobileScreenshot = false) {
  console.log(`\n======================================================================`);
  console.log(`RUNNING TEST SUITE ON: ${urlLabel}`);
  console.log(`URL: ${url}`);
  console.log(`======================================================================`);

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(err.toString());
  });

  const testResults = [];
  function record(name, pass, details = '') {
    testResults.push({ name, pass, details });
    const tag = pass ? '[PASS]' : '[FAIL]';
    console.log(`${tag} ${name}${details ? ' -> ' + details : ''}`);
  }

  try {
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(500);

    // CHECK 1: Assert ZERO console errors and ZERO pageerrors
    const check1Pass = consoleErrors.length === 0 && pageErrors.length === 0;
    record(
      'Check 1: Zero console errors & zero pageerrors on load',
      check1Pass,
      check1Pass ? 'No errors logged' : `Console errors: ${consoleErrors.join(', ')} | Page errors: ${pageErrors.join(', ')}`
    );

    // CHECK 2: Click "+" twice on item 1, then "Add to Order". Assert bottom bar updates.
    const plusBtnItem1 = await page.$('button[data-action="plus"][data-id="1"]');
    await plusBtnItem1.scrollIntoViewIfNeeded();
    await plusBtnItem1.click();
    await page.waitForTimeout(100);
    await plusBtnItem1.click();
    await page.waitForTimeout(100);

    const card1Qty = await page.$eval('#card-qty-1', el => el.textContent.trim());
    const addBtnItem1 = await page.$('button[data-action="add"][data-id="1"]');
    await addBtnItem1.click();
    await page.waitForTimeout(300);

    const barCountAfter1 = await page.$eval('#order-bar-count', el => el.textContent.trim());
    const barTotalAfter1 = await page.$eval('#order-bar-total', el => el.textContent.trim());

    // Item 1 price is 2450. 3 units = 7,350 PKR
    const check2Pass = card1Qty === '3' && barCountAfter1 === '3 items' && barTotalAfter1 === 'PKR 7,350';
    record(
      'Check 2: Click "+" twice on item 1 & "Add to Order"',
      check2Pass,
      `Card Qty: ${card1Qty}, Bottom Bar: ${barCountAfter1}, Total: ${barTotalAfter1}`
    );

    // CHECK 3: Add item 2 (qty 1) and item 3 (qty 3)
    // Item 2: default qty is 1, click Add to Order
    const addBtnItem2 = await page.$('button[data-action="add"][data-id="2"]');
    await addBtnItem2.scrollIntoViewIfNeeded();
    await addBtnItem2.click();
    await page.waitForTimeout(200);

    // Item 3: click "+" twice, then Add to Order
    const plusBtnItem3 = await page.$('button[data-action="plus"][data-id="3"]');
    await plusBtnItem3.scrollIntoViewIfNeeded();
    await plusBtnItem3.click();
    await page.waitForTimeout(100);
    await plusBtnItem3.click();
    await page.waitForTimeout(100);
    const addBtnItem3 = await page.$('button[data-action="add"][data-id="3"]');
    await addBtnItem3.click();
    await page.waitForTimeout(300);

    // Totals so far: Item 1: 3x2450 = 7350, Item 2: 1x2200 = 2200, Item 3: 3x2650 = 7950
    // Total count = 3 + 1 + 3 = 7 items. Total PKR = 7350 + 2200 + 7950 = 17,500
    const barCountAfter3 = await page.$eval('#order-bar-count', el => el.textContent.trim());
    const barTotalAfter3 = await page.$eval('#order-bar-total', el => el.textContent.trim());
    const check3Pass = barCountAfter3 === '7 items' && barTotalAfter3 === 'PKR 17,500';
    record(
      'Check 3: Add item 2 (qty 1) and item 3 (qty 3)',
      check3Pass,
      `Bottom Bar Count: ${barCountAfter3}, Total: ${barTotalAfter3}`
    );

    // CHECK 4: Click "View Order". Test the + and - buttons in the panel, then remove one item.
    const viewOrderBtn = await page.$('#btn-open-order');
    await viewOrderBtn.click();
    await page.waitForTimeout(300);

    const isModalOpen = await page.$eval('#order-modal-backdrop', el => el.classList.contains('open'));

    // Test "+" in panel on item 2 (was 1, now becomes 2)
    const panelPlusItem2 = await page.$('#order-items-list button[data-action="plus"][data-id="2"]');
    await panelPlusItem2.click();
    await page.waitForTimeout(200);

    // Test "-" in panel on item 2 (was 2, now becomes 1)
    const panelMinusItem2 = await page.$('#order-items-list button[data-action="minus"][data-id="2"]');
    await panelMinusItem2.click();
    await page.waitForTimeout(200);

    // Remove item 2 completely from panel
    const panelRemoveItem2 = await page.$('#order-items-list button[data-action="remove"][data-id="2"]');
    await panelRemoveItem2.click();
    await page.waitForTimeout(300);

    // After removing item 2 (1x2200), we have:
    // Item 1: 3x2450 = 7350
    // Item 3: 3x2650 = 7950
    // Total count = 6 items, Total PKR = 15,300
    const modalTotalAfterRemove = await page.$eval('#order-modal-total', el => el.textContent.trim());
    const remainingPanelRows = await page.$$eval('#order-items-list .order-item-row', rows => rows.length);
    const check4Pass = isModalOpen && remainingPanelRows === 2 && modalTotalAfterRemove === 'PKR 15,300';
    record(
      'Check 4: View Order panel open, test + and -, then remove item 2',
      check4Pass,
      `Modal open: ${isModalOpen}, Panel Rows: ${remainingPanelRows}, Modal Total: ${modalTotalAfterRemove}`
    );

    // CHECK 5: Fill in a name and address
    await page.fill('#order-customer-name', 'Fatima Tariq');
    await page.fill('#order-customer-address', '12-C Gulberg III, Lahore');
    await page.waitForTimeout(200);

    const nameVal = await page.$eval('#order-customer-name', el => el.value);
    const addrVal = await page.$eval('#order-customer-address', el => el.value);
    const check5Pass = nameVal === 'Fatima Tariq' && addrVal === '12-C Gulberg III, Lahore';
    record(
      'Check 5: Fill optional name and address',
      check5Pass,
      `Name: "${nameVal}", Address: "${addrVal}"`
    );

    // CHECK 6: Intercept "Send Order on WhatsApp" and print FULL decoded message and URL
    const sendBtn = await page.$('#btn-send-whatsapp-order');
    const waHref = await sendBtn.getAttribute('href');
    const urlObj = new URL(waHref);
    const decodedMessage = urlObj.searchParams.get('text');

    const expectedHeader = 'Hello Sweet Crumbs! I want to place an order:';
    const hasItem1 = decodedMessage.includes('Chocolate Fudge Cake x 3 = PKR 7,350');
    const hasItem3 = decodedMessage.includes('Red Velvet Cake x 3 = PKR 7,950');
    const hasTotal = decodedMessage.includes('Total: PKR 15,300');
    const hasName = decodedMessage.includes('Name: Fatima Tariq');
    const hasAddr = decodedMessage.includes('Address: 12-C Gulberg III, Lahore');
    const hasFooter = decodedMessage.includes('Please confirm my order. Thank you!');
    const isWaTargetBlank = (await sendBtn.getAttribute('target')) === '_blank';

    const check6Pass = waHref.startsWith('https://wa.me/923233732647') &&
      decodedMessage.includes(expectedHeader) &&
      hasItem1 && hasItem3 && hasTotal && hasName && hasAddr && hasFooter && isWaTargetBlank;

    record(
      'Check 6: WhatsApp Order link format and decoded message',
      check6Pass,
      `URL prefix valid: ${waHref.startsWith('https://wa.me/923233732647')}`
    );

    console.log('\n--- FULL DECODED WHATSAPP MESSAGE ---');
    console.log(decodedMessage);
    console.log('------------------------------------');
    console.log('FULL WHATSAPP URL:');
    console.log(waHref);
    console.log('------------------------------------\n');

    // CHECK 7: Mobile screenshot at 390x844 with order panel open
    if (takeMobileScreenshot) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(400);

      const screenshotPath = path.resolve('screenshot-mobile.png');
      await page.screenshot({ path: screenshotPath, fullPage: false });
      const screenshotExists = fs.existsSync(screenshotPath) && fs.statSync(screenshotPath).size > 0;
      record(
        'Check 7: Mobile screenshot saved at 390x844 (screenshot-mobile.png)',
        screenshotExists,
        `Path: ${screenshotPath} (${fs.statSync(screenshotPath).size} bytes)`
      );
    }

    // CHECK 8: Final Console Errors Check
    const check8Pass = consoleErrors.length === 0 && pageErrors.length === 0;
    record(
      'Check 8: Zero console errors & zero pageerrors throughout entire interaction',
      check8Pass,
      check8Pass ? 'Clean console throughout' : `Errors: ${consoleErrors.concat(pageErrors).join('; ')}`
    );

  } catch (err) {
    record('Unexpected Test Exception', false, err.stack || err.toString());
  } finally {
    await browser.close();
  }

  const allPassed = testResults.every(r => r.pass);
  console.log(`\nOVERALL SUITE RESULT FOR ${urlLabel}: ${allPassed ? 'ALL PASS' : 'SOME CHECKS FAILED'}\n`);
  return allPassed;
}

async function main() {
  const fileUrl = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');
  const httpUrl = 'http://localhost:3000/index.html';

  console.log('Starting Sweet Crumbs Lahore Automated Playwright Test Suite...\n');

  const filePass = await runTestSuite('FILE PROTOCOL (file:///)', fileUrl, false);
  const httpPass = await runTestSuite('HTTP LOCALHOST (http://localhost:3000)', httpUrl, true);

  if (filePass && httpPass) {
    console.log('======================================================================');
    console.log('FINAL VERDICT: ALL TESTS PASSED ACROSS BOTH FILE:/// AND HTTP:// !');
    console.log('======================================================================');
    process.exit(0);
  } else {
    console.error('======================================================================');
    console.error('FINAL VERDICT: ONE OR MORE TESTS FAILED.');
    console.error('======================================================================');
    process.exit(1);
  }
}

main();

