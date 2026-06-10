import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { Product } from './myntra';

const TIMEOUT = parseInt(process.env.SCRAPE_TIMEOUT_MS || '30000', 10);
const MAX_PRODUCTS = parseInt(process.env.MAX_PRODUCTS || '10', 10);
const HEADLESS = process.env.HEADLESS !== 'false';

async function createStealthContext(browser: Browser): Promise<BrowserContext> {
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
    geolocation: { latitude: 12.9716, longitude: 77.5946 },
    permissions: ['geolocation'],
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
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
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-IN', 'en-GB', 'en-US', 'en'],
    });
    (window as any).chrome = {
      runtime: {},
      loadTimes: () => ({}),
      csi: () => ({}),
    };
  });

  return context;
}

export async function scrapeNykaa(keyword: string): Promise<Product[]> {
  let browser: Browser | null = null;
  const startTime = Date.now();

  console.log(`[Nykaa] Starting scrape for: "${keyword}"`);

  try {
    browser = await chromium.launch({
      headless: HEADLESS,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });

    const context = await createStealthContext(browser);
    const page: Page = await context.newPage();

    await page.route('**/*.{png,jpg,jpeg,gif,svg,webp,woff,woff2,ttf,eot}', (route) =>
      route.abort()
    );

    console.log('[Nykaa] Visiting homepage...');
    await page.goto('https://www.nykaa.com/', {
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUT,
    });
    await page.waitForTimeout(2000);

    const searchUrl = `https://www.nykaa.com/search/result/?q=${encodeURIComponent(keyword)}`;
    console.log(`[Nykaa] Navigating to: ${searchUrl}`);

    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUT,
    });

    await page.waitForTimeout(4000);

    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(600);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    const products: Product[] = await page.evaluate((maxProducts: number) => {
      const items: Product[] = [];
      const productCards = document.querySelectorAll('.css-xrzmfa, .product-list-box, [class*="product-card"]');
      const cards = Array.from(productCards).slice(0, maxProducts);

      for (const card of cards) {
        let title = 'N/A';
        let price = 'N/A';
        let rating = 'N/A';
        let discount = 'N/A';
        let brand = 'N/A';

        // Extract title
        const titleEl = card.querySelector('.css-xrzmfa, .css-xrzmfa span, .css-1b12w7x, [class*="title"]') || card.querySelector('div.css-xrzmfa');
        if (titleEl) {
           title = titleEl.textContent?.trim() || 'N/A';
        }

        // Try to infer brand from title or specific class
        // Nykaa usually includes brand at the start of the title, or a separate element
        const brandEl = card.querySelector('[class*="brand"], [class*="Brand"]');
        if (brandEl) {
            brand = brandEl.textContent?.trim() || 'N/A';
        } else if (title !== 'N/A') {
            const parts = title.split(' ');
            if (parts.length > 0) {
               brand = parts[0]; // best effort fallback
            }
        }

        // Extract Price
        const priceEl = card.querySelector('.css-111z9ua, .css-1jczs19, [class*="price"]') || Array.from(card.querySelectorAll('span, div')).find(el => /^₹\s?\d/.test(el.textContent?.trim() || ''));
        if (priceEl) {
            price = priceEl.textContent?.trim() || 'N/A';
        }

        // Extract Discount
        const discEl = card.querySelector('.css-cjd9an, [class*="discount"]') || Array.from(card.querySelectorAll('span')).find(el => /%\s*Off/i.test(el.textContent?.trim() || ''));
        if (discEl) {
            discount = discEl.textContent?.trim() || 'N/A';
        }

        // Extract Rating
        const ratingEl = card.querySelector('.css-1m1n7za, [class*="rating"]') || Array.from(card.querySelectorAll('span, div')).find(el => /^[1-5]\.\d/.test(el.textContent?.trim() || '') && (el.textContent?.trim().length || 0) < 6);
        if (ratingEl) {
            rating = ratingEl.textContent?.trim() || 'N/A';
        }

        if (title === 'N/A') {
             // Let's try raw extraction like Flipkart
             const textNodes: string[] = [];
             const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, null);
             let node;
             while ((node = walker.nextNode())) {
                 const text = node.textContent?.trim();
                 if (text) textNodes.push(text);
             }
             for (const t of textNodes) {
                 if (/^₹/.test(t) && price === 'N/A') price = t;
                 else if (/%/.test(t) && discount === 'N/A') discount = t;
                 else if (/^[1-5]\.\d$/.test(t) && rating === 'N/A') rating = t;
                 else if (t.length > 5 && title === 'N/A' && !/^[1-5]\.\d/.test(t)) title = t;
             }
        }

        if (title !== 'N/A' || price !== 'N/A') {
          items.push({ title, price, rating, discount, brand });
        }
      }

      return items;
    }, MAX_PRODUCTS);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Nykaa] Scraped ${products.length} products in ${elapsed}s`);

    return products;
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`[Nykaa] Scrape failed after ${elapsed}s:`, error instanceof Error ? error.message : error);
    return [];
  } finally {
    if (browser) {
      await browser.close().catch((err) =>
        console.error('[Nykaa] Browser cleanup error:', err)
      );
      console.log('[Nykaa] Browser closed');
    }
  }
}
