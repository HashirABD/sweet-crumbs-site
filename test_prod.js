const { chromium } = require('playwright-core');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const prodUrl = 'https://sweet-crumbs-site.vercel.app';

async function testProduction() {
  console.log(`\n======================================================================`);
  console.log(`TESTING LIVE PRODUCTION URL: ${prodUrl}`);
  console.log(`======================================================================\n`);

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 }
  });

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

  try {
    const response = await page.goto(prodUrl, { waitUntil: 'load' });
    const status = response.status();
    console.log(`HTTP Status: ${status}`);

    await page.waitForTimeout(500);

    // 1. Zero Console Errors Check
    const cleanConsole = consoleErrors.length === 0 && pageErrors.length === 0;
    console.log(`[${cleanConsole ? 'PASS' : 'FAIL'}] Check 1: Zero console errors & pageerrors (Count: ${consoleErrors.length + pageErrors.length})`);

    // 2. Click "+" on Item 1
    const plusBtnItem1 = await page.$('button[data-action="plus"][data-id="1"]');
    await plusBtnItem1.scrollIntoViewIfNeeded();
    await plusBtnItem1.click();
    await page.waitForTimeout(200);

    const qtyAfterPlus = await page.$eval('#card-qty-1', el => el.textContent.trim());
    const plusWorked = qtyAfterPlus === '2';
    console.log(`[${plusWorked ? 'PASS' : 'FAIL'}] Check 2: Click "+" on Item 1 (Quantity: ${qtyAfterPlus})`);

    // 3. Click "Add to Order" on Item 1
    const addBtnItem1 = await page.$('button[data-action="add"][data-id="1"]');
    await addBtnItem1.click();
    await page.waitForTimeout(400);

    const barCount = await page.$eval('#order-bar-count', el => el.textContent.trim());
    const barTotal = await page.$eval('#order-bar-total', el => el.textContent.trim());
    const addWorked = barCount === '2 items' && barTotal === 'PKR 4,900';
    console.log(`[${addWorked ? 'PASS' : 'FAIL'}] Check 3: Click "Add to Order" on Item 1 (${barCount}, ${barTotal})`);

    // 4. Open Order Panel
    const viewOrderBtn = await page.$('#btn-open-order');
    await viewOrderBtn.click();
    await page.waitForTimeout(300);

    const isModalOpen = await page.$eval('#order-modal-backdrop', el => el.classList.contains('open'));
    console.log(`[${isModalOpen ? 'PASS' : 'FAIL'}] Check 4: Open Order Drawer/Panel (Open: ${isModalOpen})`);

    // 5. Fill optional Name & Address
    await page.fill('#order-customer-name', 'Fatima Tariq');
    await page.fill('#order-customer-address', '12-C Gulberg III, Lahore');
    await page.waitForTimeout(200);

    // 6. Read and verify WhatsApp link
    const sendBtn = await page.$('#btn-send-whatsapp-order');
    const waHref = await sendBtn.getAttribute('href');
    const urlObj = new URL(waHref);
    const decodedMessage = urlObj.searchParams.get('text');

    const hasHeader = decodedMessage.includes('Hello Sweet Crumbs! I want to place an order:');
    const hasItem = decodedMessage.includes('Chocolate Fudge Cake x 2 = PKR 4,900');
    const hasTotal = decodedMessage.includes('Total: PKR 4,900');
    const hasName = decodedMessage.includes('Name: Fatima Tariq');
    const hasAddr = decodedMessage.includes('Address: 12-C Gulberg III, Lahore');
    const hasFooter = decodedMessage.includes('Please confirm my order. Thank you!');

    const waPassed = waHref.startsWith('https://wa.me/923233732647') &&
      hasHeader && hasItem && hasTotal && hasName && hasAddr && hasFooter;

    console.log(`[${waPassed ? 'PASS' : 'FAIL'}] Check 5: WhatsApp Order Message Generation & URL`);

    console.log('\n--- FINAL DECODED WHATSAPP MESSAGE ---');
    console.log(decodedMessage);
    console.log('--------------------------------------');
    console.log('FINAL WHATSAPP URL:');
    console.log(waHref);
    console.log('--------------------------------------\n');

    const allPassed = cleanConsole && plusWorked && addWorked && isModalOpen && waPassed;
    console.log(`OVERALL PRODUCTION VERDICT: ${allPassed ? 'ALL CHECKS PASSED' : 'FAILED'}`);
    process.exit(allPassed ? 0 : 1);

  } catch (err) {
    console.error('Production test error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testProduction();

