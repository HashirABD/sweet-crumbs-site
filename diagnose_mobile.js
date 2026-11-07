const { chromium } = require('playwright-core');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const widths = [320, 360, 375, 390, 430];
const fileUrl = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');

async function diagnoseMobile() {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true
  });

  console.log('======================================================================');
  console.log('MOBILE OVERFLOW DIAGNOSTICS (STEP 1)');
  console.log('URL: ' + fileUrl);
  console.log('======================================================================\n');

  for (const w of widths) {
    const context = await browser.newContext({
      viewport: { width: w, height: 740 },
      isMobile: true,
      hasTouch: true
    });
    const page = await context.newPage();

    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForTimeout(300);

    const result = await page.evaluate((targetWidth) => {
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      const metaEl = document.querySelector('meta[name="viewport"]');
      const metaViewport = metaEl ? metaEl.getAttribute('content') : null;
      const metaExactMatch = metaViewport === 'width=device-width, initial-scale=1';

      // Find all elements whose right boundary exceeds the target width
      const checkBoundary = targetWidth;
      const allElements = Array.from(document.querySelectorAll('*'));
      const overflowing = [];

      for (const el of allElements) {
        const tag = el.tagName.toLowerCase();
        if (['script', 'style', 'head', 'meta', 'link', 'title'].includes(tag)) continue;

        const rect = el.getBoundingClientRect();
        if (rect.right > checkBoundary + 1) {
          overflowing.push({
            tag: el.tagName,
            id: el.id || '',
            className: typeof el.className === 'string' ? el.className : '',
            width: Math.round(rect.width * 10) / 10,
            right: Math.round(rect.right * 10) / 10,
            overflowAmount: Math.round((rect.right - checkBoundary) * 10) / 10
          });
        }
      }

      return {
        targetWidth,
        innerWidth,
        scrollWidth,
        hasOverflow: scrollWidth > targetWidth || innerWidth > targetWidth,
        metaViewport,
        metaExactMatch,
        overflowing
      };
    }, w);

    console.log(`--- SCREEN WIDTH: ${w}px ---`);
    console.log(`document.documentElement.scrollWidth: ${result.scrollWidth}px vs window.innerWidth: ${result.innerWidth}px (Target: ${w}px)`);
    console.log(`Meta Viewport: "${result.metaViewport}" (Exact match "width=device-width, initial-scale=1": ${result.metaExactMatch ? 'YES' : 'NO'})`);
    console.log(`Overflowing Elements count: ${result.overflowing.length}`);
    if (result.overflowing.length > 0) {
      console.log('List of overflowing elements:');
      result.overflowing.forEach(o => {
        const idStr = o.id ? ` #${o.id}` : '';
        const classStr = o.className ? ` .${o.className.trim().replace(/\s+/g, '.')}` : '';
        console.log(`  - <${o.tag.toLowerCase()}${idStr}${classStr}>: width=${o.width}px, right=${o.right}px (+${o.overflowAmount}px past ${w}px)`);
      });
    } else {
      console.log('  No overflowing elements found.');
    }
    console.log('');

    await context.close();
  }

  await browser.close();
}

diagnoseMobile().catch(console.error);
