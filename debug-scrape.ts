import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

const KEYWORD = 'cotton kurti';

async function debug() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
      'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    },
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-IN', 'en-GB', 'en-US', 'en'] });
    (window as any).chrome = { runtime: {}, loadTimes: () => ({}), csi: () => ({}) };
  });

  const dataDir = path.join(process.cwd(), 'data', 'debug');
  await fs.mkdir(dataDir, { recursive: true });

  // ─── FLIPKART ──────────────────────────────────────────────────────
  console.log('\n=== FLIPKART ===');
  const page = await context.newPage();

  try {
    console.log('Step 1: Visiting homepage...');
    await page.goto('https://www.flipkart.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('Homepage title:', await page.title());

    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(KEYWORD)}`;
    console.log(`\nStep 2: Navigating to: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    console.log('Search page title:', await page.title());
    await page.screenshot({ path: path.join(dataDir, 'flipkart.png'), fullPage: false });

    const info = await page.evaluate(() => {
      // Find elements with ₹ to locate product cards
      const priceEls = Array.from(document.querySelectorAll('*'))
        .filter(el => /₹\s?\d/.test(el.textContent || '') && el.children.length === 0)
        .slice(0, 10)
        .map(el => {
          let current = el.parentElement;
          let depth = 0;
          let cardClass = '';
          while (current && depth < 5) {
            if (current.tagName === 'A' || current.tagName === 'DIV') {
              cardClass = current.className;
            }
            current = current.parentElement;
            depth++;
          }
          return {
            tag: el.tagName,
            text: el.textContent?.trim().substring(0, 80),
            parentClasses: el.parentElement?.className?.toString().substring(0, 80),
            ancestorClass: cardClass
          };
        });

      return {
        title: document.title,
        totalElements: document.querySelectorAll('*').length,
        priceEls,
        bodyPreview: document.body.textContent?.substring(0, 400) || '',
      };
    });

    console.log('Price elements:', info.priceEls);
    await fs.writeFile(path.join(dataDir, 'flipkart.html'), await page.content());

  } catch (err: any) {
    console.error('Flipkart error:', err.message);
  }

  await browser.close();
  console.log('\n✅ Debug complete');
}

debug().catch(console.error);
