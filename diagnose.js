const { chromium } = require('playwright-core');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function diagnoseUrl(urlLabel, url) {
  console.log(`\n==================================================`);
  console.log(`DIAGNOSING: ${urlLabel} (${url})`);
  console.log(`==================================================`);

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true
  });

  const page = await browser.newPage();

  const consoleMessages = [];
  const pageErrors = [];

  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    pageErrors.push(err.toString());
  });

  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  // 1. Initial State
  const initialState = await page.evaluate(() => {
    return {
      typeofSITE_CONFIG: typeof SITE_CONFIG,
      typeofWindowSITE_CONFIG: typeof window.SITE_CONFIG,
      hasChangeCardQty: typeof window.changeCardQty,
      hasAddItemToCart: typeof window.addItemToCart,
      orderBarCountText: document.getElementById('order-bar-count')?.textContent?.trim(),
      card1QtyText: document.getElementById('card-qty-1')?.textContent?.trim()
    };
  });
  console.log('Initial page state:', JSON.stringify(initialState, null, 2));

  // 2. Element at button center (elementFromPoint check for overlays)
  const plusHandle = await page.$('[data-action="plus"]');
  const addHandle = await page.$('[data-action="add"]');
  if (plusHandle) await plusHandle.scrollIntoViewIfNeeded();

  const elementOverlapInfo = await page.evaluate(() => {
    const plusBtn = document.querySelector('[data-action="plus"]');
    const addBtn = document.querySelector('[data-action="add"]');

    function checkElem(el, name) {
      if (!el) return { name, found: false };
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const topElem = document.elementFromPoint(cx, cy);
      return {
        name,
        found: true,
        buttonOuterHTML: el.outerHTML,
        cx,
        cy,
        rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width, height: rect.height },
        topElemTag: topElem ? topElem.tagName : null,
        topElemId: topElem ? topElem.id : null,
        topElemClass: topElem ? topElem.className : null,
        isTargetOrChild: topElem ? (el === topElem || el.contains(topElem)) : false,
        topElemOuterHTML: topElem ? topElem.outerHTML.substring(0, 200) : null
      };
    }

    return {
      plusButton: checkElem(plusBtn, 'Plus Button'),
      addButton: checkElem(addBtn, 'Add to Order Button')
    };
  });
  console.log('\nElementFromPoint Overlay Check:');
  console.log(JSON.stringify(elementOverlapInfo, null, 2));

  // 3. Click one "+" button
  console.log('\nAttempting to click first "+" button...');
  const plusBtnSelector = 'button[data-action="plus"][data-id="1"]';
  const plusBtn = await page.$(plusBtnSelector);
  if (plusBtn) {
    await plusBtn.scrollIntoViewIfNeeded();
    await plusBtn.click();
    await page.waitForTimeout(300);
  } else {
    console.log('No plus button found matching selector!');
  }

  const stateAfterPlus = await page.evaluate(() => {
    return {
      card1QtyText: document.getElementById('card-qty-1')?.textContent?.trim(),
      windowCart: window.cart
    };
  });
  console.log('State after clicking "+":', JSON.stringify(stateAfterPlus, null, 2));

  // 4. Click one "Add to Order" button
  console.log('\nAttempting to click first "Add to Order" button...');
  const addBtnSelector = '[data-action="add"], .btn-add-order';
  const addBtn = await page.$(addBtnSelector);
  if (addBtn) {
    await addBtn.click();
    await page.waitForTimeout(500);
  } else {
    console.log('No Add to Order button found matching selector!');
  }

  const stateAfterAdd = await page.evaluate(() => {
    return {
      windowCart: window.cart,
      orderBarCountText: document.getElementById('order-bar-count')?.textContent?.trim(),
      orderBarTotalText: document.getElementById('order-bar-total')?.textContent?.trim()
    };
  });
  console.log('State after clicking "Add to Order":', JSON.stringify(stateAfterAdd, null, 2));

  // 5. Console errors & Page errors
  console.log('\nConsole messages (all):');
  if (consoleMessages.length === 0) console.log('  (none)');
  consoleMessages.forEach(m => console.log('  ' + m));

  console.log('\nPage errors (uncaught exceptions):');
  if (pageErrors.length === 0) console.log('  (none)');
  pageErrors.forEach(e => console.log('  ' + e));

  await browser.close();
}

async function run() {
  try {
    const fileUrl = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');
    await diagnoseUrl('FILE URL', fileUrl);
    await diagnoseUrl('HTTP LOCALHOST URL', 'http://localhost:3000/index.html');
  } catch (err) {
    console.error('Diagnostic run error:', err);
  }
}

run();
