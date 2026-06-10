# Fashion Market Signal Agent

A Proof of Concept (POC) system designed to aggregate real-time fashion market signals and product intelligence across multiple major Indian e-commerce platforms using intelligent browser automation.

## Features

- **Multi-Platform Scraping**: Pulls live product data from 5 major platforms simultaneously:
  - Myntra
  - Meesho
  - Flipkart
  - Nykaa
  - Amazon
- **Real-Time Data Aggregation**: Searches for a given fashion keyword across all platforms in parallel and aggregates the results into a unified JSON format.
- **Advanced Stealth Automation**: Uses Playwright with custom stealth contexts to bypass common bot detection mechanisms.
- **Interactive Web Interface**: Provides a sleek, modern, and responsive UI to query keywords and visualize the aggregated marketplace data side-by-side.

---

## Architecture & Data Flow

The system is built on a Node.js backend using **Express** for the web/API server and **Playwright** for browser automation.

### Data Flow
1. **User Input**: A user inputs a fashion keyword (e.g., "cotton kurti") into the web UI.
2. **API Request**: The frontend makes a `POST /analyze` request to the backend with the search keyword.
3. **Parallel Scraping**: The `/analyze` route triggers 5 asynchronous Playwright scraper functions (`Promise.all()`)—one for each marketplace.
4. **Browser Automation**:
   - Playwright launches stealth browser contexts.
   - Resource blocking (images, fonts, media) is enabled to drastically improve load speeds while keeping scripts intact for React/Angular hydration.
   - The browser navigates to the target search URL, simulates human scrolling to trigger lazy loading, and parses the DOM.
5. **Data Extraction**: Custom selector logic and fallback text parsing algorithms extract standard fields: `title`, `brand`, `price`, `discount`, and `rating`.
6. **Data Storage**: The combined payload is saved to the local disk as `data/latest-results.json` for persistent logging.
7. **Response**: The JSON data is returned to the frontend, which dynamically renders the product cards in their respective marketplace panels.

---

## Folder Structure

```
fashion-market-signal-agent/
│
├── src/
│   ├── routes/
│   │   └── analyze.ts       # Express router for the POST /analyze endpoint
│   │
│   ├── scrapers/            # Playwright browser automation scripts
│   │   ├── amazon.ts
│   │   ├── flipkart.ts
│   │   ├── meesho.ts
│   │   ├── myntra.ts
│   │   └── nykaa.ts
│   │
│   └── server.ts            # Main Express server entrypoint & HTML frontend UI
│
├── data/                    # Generated output folder
│   └── latest-results.json  # Raw JSON dump of the most recent analysis
│
├── package.json
└── tsconfig.json
```

---

## Browser Automation Capabilities

This project relies heavily on **Playwright** to scrape complex Single Page Applications (SPAs) that cannot be scraped via standard HTTP requests (e.g., `axios` + `cheerio`).

**Key Automation Features:**
- **Stealth Contexts**: Bypasses headless browser detection by spoofing `navigator.webdriver`, injecting realistic `plugins` and `languages`, mimicking permissions APIs, and passing specialized `sec-ch-ua` headers.
- **Resource Optimization**: Actively intercepts and aborts network requests for heavy assets (`.png`, `.jpg`, `.woff`, etc.) while allowing critical JavaScript to execute.
- **Lazy Loading Triggers**: Automatically evaluates `window.scrollBy` to scroll down the page iteratively, forcing the target site to load dynamic content.
- **Fallback Parsers**: Includes complex DOM traversal fallbacks (like raw text node extraction and regex matching) if a website dynamically obfuscates or changes its CSS class names.

---

## API Documentation

### `POST /analyze`
Initiates a parallel scraping job across all supported platforms for a given keyword.

**Request Body**
```json
{
  "keyword": "silk saree"
}
```

**Response Format (200 OK)**
```json
{
  "keyword": "silk saree",
  "timestamp": "2026-06-10T12:00:00.000Z",
  "myntra": [ { "title": "...", "price": "...", "rating": "...", "discount": "...", "brand": "..." } ],
  "meesho": [ /* ... */ ],
  "flipkart": [ /* ... */ ],
  "nykaa": [ /* ... */ ],
  "amazon": [ /* ... */ ]
}
```

---

## Outputs

All completed analyses are not only returned via the API but are also persistently written to disk.
- **Location**: `data/latest-results.json`
- **Purpose**: Allows downstream systems or external agents to consume the aggregated fashion signals for trend analysis, pricing parity checks, or competitive intelligence without needing to hit the API again.

---

## Getting Started

### Dependencies
- **Node.js** (v18+)
- **TypeScript**
- **Express.js**
- **Playwright**

### Installation

1. Install Node dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browser binaries:
   ```bash
   npx playwright install chromium
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Navigate to `http://localhost:3000` to interact with the UI.

### Environment Variables
You can configure the agent via a `.env` file in the root directory:
- `PORT`: Port to run the Express server (default: `3000`)
- `HEADLESS`: Set to `false` to visibly watch the browsers scrape (default: `true`)
- `MAX_PRODUCTS`: Number of products to pull per platform (default: `10`)
- `SCRAPE_TIMEOUT_MS`: Max duration allowed for an individual scrape before timing out (default: `30000`)
