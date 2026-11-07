const { chromium } = require('playwright-core');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const widths = [320, 360, 375, 390, 430];
const fileUrl = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');

async function runMobileTests() {
  console.log('======================================================================');
  console.log('SWEET CRUMBS LAHORE - MOBILE RESPONSIVENESS & OVERFLOW VERIFICATION');
  console.log('Testing file: ' + fileUrl);
  console.log('======================================================================\n');

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  let allPassed = true;
  const consoleErrors = [];

  // Check 1: Horizontal Overflow across all target widths
  console.log('--- TEST 1: HORIZONTAL OVERFLOW CHECK (scrollWidth vs innerWidth) ---');
  for (const w of widths) {
    const context = await browser.newContext({
      viewport: { width: w, height: 740 },
      isMobile: true,
      hasTouch: true
    });
    const page = await context.newPage();
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(`[${w}px Console Error] ${msg.text()}`);
    });
    page.on('pageerror', err => {
      consoleErrors.push(`[${w}px Page Error] ${err.message}`);
    });

    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForTimeout(200);

    const result = await page.evaluate((targetWidth) => {
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      const meta = document.querySelector('meta[name="viewport"]');
      const metaContent = meta ? meta.getAttribute('content') : null;

      const overflowing = [];
      const all = Array.from(document.querySelectorAll('*'));
      for (const el of all) {
        const tag = el.tagName.toLowerCase();
        if (['script', 'style', 'head', 'meta', 'link', 'title'].includes(tag)) continue;
        const rect = el.getBoundingClientRect();
        if (rect.right > targetWidth + 1) {
          overflowing.push({
            tag: el.tagName,
            id: el.id,
            className: typeof el.className === 'string' ? el.className : '',
            right: Math.round(rect.right * 10) / 10,
            width: Math.round(rect.width * 10) / 10
          });
        }
      }

      return {
        targetWidth,
        scrollWidth,
        innerWidth,
        metaContent,
        overflowing
      };
    }, w);

    const pass = (result.scrollWidth <= w) && (result.innerWidth === w) && (result.overflowing.length === 0);
    if (!pass) allPassed = false;

    console.log(`Width ${w}px: [${pass ? 'PASS' : 'FAIL'}] scrollWidth=${result.scrollWidth}px, innerWidth=${result.innerWidth}px, overflowing elements=${result.overflowing.length}`);
    if (result.overflowing.length > 0) {
      console.log('  Overflowing elements:');
      result.overflowing.forEach(o => {
        console.log(`    <${o.tag} id="${o.id}" class="${o.className}"> right=${o.right}px, width=${o.width}px`);
      });
    }

    await context.close();
  }

  // Check 2: Mobile Emulation Interactions (tap +, tap Add to Order, View Order, input name, send WhatsApp)
  console.log('\n--- TEST 2: MOBILE INTERACTION & WHATSAPP ORDER GENERATION ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone SE
    isMobile: true,
    hasTouch: true
  });
  const page = await mobileContext.newPage();
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(200);

  // 1. Tap '+' on Item 1 (Chocolate Fudge Cake)
  const plusBtn = page.locator('button[data-action="plus"][data-id="1"]');
  await plusBtn.tap();
  const qtyAfterPlus = await page.locator('#card-qty-1').innerText();
  console.log(`Tap '+' on Item 1: Card quantity display = ${qtyAfterPlus} (Expected: 2)`);

  // 2. Tap 'Add to Order' on Item 1
  const addBtn = page.locator('button[data-action="add"][data-id="1"]');
  await addBtn.tap();
  await page.waitForTimeout(100);
  const barCount = await page.locator('#order-bar-count').innerText();
  const barTotal = await page.locator('#order-bar-total').innerText();
  console.log(`Tap 'Add to Order': Floating bar count = "${barCount}", total = "${barTotal}" (Expected: 2 items, PKR 4,900)`);

  // 3. Tap 'View Order' to open panel
  const viewOrderBtn = page.locator('#btn-open-order');
  await viewOrderBtn.tap();
  await page.waitForTimeout(200);

  const isModalOpen = await page.locator('#order-modal-backdrop').evaluate(el => el.classList.contains('open'));
  console.log(`Tap 'View Order': Order panel open = ${isModalOpen} (Expected: true)`);

  // 4. Type Name & Address in panel
  await page.fill('#order-customer-name', 'Sara Khan');
  await page.fill('#order-customer-address', 'House 14, Street 3, DHA Phase 5, Lahore');
  await page.waitForTimeout(100);

  // 5. Inspect Send Order on WhatsApp href
  const sendHref = await page.locator('#btn-send-whatsapp-order').getAttribute('href');
  console.log(`Generated WhatsApp Order URL:\n${sendHref}`);

  const decodedUrl = decodeURIComponent(sendHref);
  const hasExpectedGreeting = decodedUrl.includes('Hello Sweet Crumbs! I want to place an order:');
  const hasExpectedItem = decodedUrl.includes('1. Chocolate Fudge Cake x 2 = PKR 4,900');
  const hasExpectedTotal = decodedUrl.includes('Total: PKR 4,900');
  const hasExpectedName = decodedUrl.includes('Name: Sara Khan');
  const hasExpectedAddress = decodedUrl.includes('Address: House 14, Street 3, DHA Phase 5, Lahore');
  const hasPhoneCorrect = sendHref.startsWith('https://wa.me/923233732647');

  console.log(`Link verification:`);
  console.log(`  - Correct wa.me number (923233732647): ${hasPhoneCorrect ? 'PASS' : 'FAIL'}`);
  console.log(`  - Greeting included: ${hasExpectedGreeting ? 'PASS' : 'FAIL'}`);
  console.log(`  - Item line included (2x): ${hasExpectedItem ? 'PASS' : 'FAIL'}`);
  console.log(`  - Grand total included: ${hasExpectedTotal ? 'PASS' : 'FAIL'}`);
  console.log(`  - Customer Name included: ${hasExpectedName ? 'PASS' : 'FAIL'}`);
  console.log(`  - Customer Address included: ${hasExpectedAddress ? 'PASS' : 'FAIL'}`);

  // Screenshot 1: Opened Order Panel on Mobile (iPhone SE: 375x667)
  const panelPath = path.resolve('screenshot-panel-mobile.png');
  await page.screenshot({ path: panelPath });
  console.log(`Screenshot saved: screenshot-panel-mobile.png`);

  await mobileContext.close();

  // Check 3: Full page screenshots on mobile devices
  console.log('\n--- TEST 3: FULL PAGE MOBILE SCREENSHOTS ---');
  // Device 1: 360x800 (Common Android)
  const ctx360 = await browser.newContext({
    viewport: { width: 360, height: 800 },
    isMobile: true,
    hasTouch: true
  });
  const page360 = await ctx360.newPage();
  await page360.goto(fileUrl, { waitUntil: 'load' });
  await page360.waitForTimeout(300);
  const shot360 = path.resolve('screenshot-360x800.png');
  await page360.screenshot({ path: shot360, fullPage: true });
  console.log(`Full-page screenshot saved: screenshot-360x800.png`);
  await ctx360.close();

  // Device 2: 390x844 (iPhone 12/13/14)
  const ctx390 = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const page390 = await ctx390.newPage();
  await page390.goto(fileUrl, { waitUntil: 'load' });
  await page390.waitForTimeout(300);
  const shot390 = path.resolve('screenshot-390x844.png');
  await page390.screenshot({ path: shot390, fullPage: true });
  console.log(`Full-page screenshot saved: screenshot-390x844.png`);
  await ctx390.close();

  console.log('\n--- CONSOLE ERRORS CHECK ---');
  if (consoleErrors.length === 0) {
    console.log('Console Errors: ZERO (PASS)');
  } else {
    console.log(`Console Errors detected (${consoleErrors.length}):`);
    consoleErrors.forEach(err => console.log('  ' + err));
  }

  await browser.close();

  console.log('\n======================================================================');
  console.log(`OVERALL TEST STATUS: ${allPassed && consoleErrors.length === 0 ? 'ALL TESTS PASSED' : 'TESTS FAILED'}`);
  console.log('======================================================================');
}

runMobileTests().catch(err => {
  console.error('Test run failed with error:', err);
  process.exit(1);
});

