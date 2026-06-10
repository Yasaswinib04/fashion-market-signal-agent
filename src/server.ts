import express from 'express';
import dotenv from 'dotenv';
import { analyzeRouter } from './routes/analyze';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(express.json());

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/analyze', analyzeRouter);

// ─── Test Page (GET /) ───────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(getTestPageHTML());
});

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('┌──────────────────────────────────────────────────────┐');
  console.log('│  🛍️  Fashion Market Signal Agent                     │');
  console.log('│                                                      │');
  console.log(`│  ➜  Test Page:  http://localhost:${PORT}                │`);
  console.log(`│  ➜  API:        POST http://localhost:${PORT}/analyze   │`);
  console.log('│                                                      │');
  console.log('│  Ready to collect market signals!                    │');
  console.log('└──────────────────────────────────────────────────────┘');
  console.log('');
});

// ─── Test Page HTML ──────────────────────────────────────────────────────────
function getTestPageHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fashion Market Signal Agent</title>
  <meta name="description" content="Collect and analyze fashion market signals from Myntra and Meesho">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --bg-primary: #0a0a0f;
      --bg-secondary: #12121a;
      --bg-card: rgba(255, 255, 255, 0.03);
      --bg-card-hover: rgba(255, 255, 255, 0.06);
      --border-color: rgba(255, 255, 255, 0.08);
      --text-primary: #e8e8f0;
      --text-secondary: #8888a0;
      --text-muted: #55556a;
      --accent-violet: #8b5cf6;
      --accent-violet-soft: rgba(139, 92, 246, 0.15);
      --accent-pink: #ec4899;
      --accent-emerald: #10b981;
      --accent-amber: #f59e0b;
      --gradient-hero: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%);
      --gradient-myntra: linear-gradient(135deg, #ff3f6c 0%, #ff6b8a 100%);
      --gradient-meesho: linear-gradient(135deg, #570a57 0%, #8b2f8b 100%);
      --shadow-glow: 0 0 60px rgba(139, 92, 246, 0.15);
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-xl: 24px;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* Animated background mesh */
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background:
        radial-gradient(ellipse 80% 50% at 20% 40%, rgba(139, 92, 246, 0.08) 0%, transparent 70%),
        radial-gradient(ellipse 60% 40% at 80% 20%, rgba(236, 72, 153, 0.06) 0%, transparent 70%),
        radial-gradient(ellipse 50% 60% at 60% 80%, rgba(245, 158, 11, 0.04) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
    }

    .container {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 24px;
    }

    /* Header */
    .header {
      text-align: center;
      margin-bottom: 48px;
    }

    .header__badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: var(--accent-violet-soft);
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      color: var(--accent-violet);
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    .header__title {
      font-size: 44px;
      font-weight: 800;
      letter-spacing: -1.5px;
      background: var(--gradient-hero);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.1;
      margin-bottom: 12px;
    }

    .header__subtitle {
      color: var(--text-secondary);
      font-size: 16px;
      font-weight: 400;
      max-width: 500px;
      margin: 0 auto;
      line-height: 1.5;
    }

    /* Search Section */
    .search-section {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      padding: 32px;
      margin-bottom: 32px;
      backdrop-filter: blur(20px);
      box-shadow: var(--shadow-glow);
    }

    .search-form {
      display: flex;
      gap: 12px;
      align-items: stretch;
    }

    .search-input {
      flex: 1;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      font-weight: 400;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .search-input::placeholder {
      color: var(--text-muted);
    }

    .search-input:focus {
      border-color: var(--accent-violet);
      box-shadow: 0 0 0 3px var(--accent-violet-soft);
    }

    .search-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 16px 28px;
      background: var(--gradient-hero);
      border: none;
      border-radius: var(--radius-md);
      color: white;
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s ease, transform 0.1s ease;
      white-space: nowrap;
    }

    .search-btn:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .search-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .search-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .search-btn .spinner {
      display: none;
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .search-btn.loading .spinner {
      display: inline-block;
    }

    .search-btn.loading .btn-text {
      display: none;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Status Bar */
    .status-bar {
      display: none;
      align-items: center;
      gap: 10px;
      margin-top: 16px;
      padding: 12px 16px;
      background: rgba(139, 92, 246, 0.08);
      border: 1px solid rgba(139, 92, 246, 0.15);
      border-radius: var(--radius-sm);
      font-size: 13px;
      color: var(--text-secondary);
    }

    .status-bar.visible {
      display: flex;
    }

    .status-bar .pulse {
      width: 8px;
      height: 8px;
      background: var(--accent-violet);
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }

    /* Error State */
    .error-bar {
      display: none;
      margin-top: 16px;
      padding: 14px 18px;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: var(--radius-sm);
      font-size: 13px;
      color: #f87171;
    }

    .error-bar.visible {
      display: block;
    }

    /* Results Grid */
    .results-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    @media (max-width: 1024px) {
      .results-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 768px) {
      .results-grid {
        grid-template-columns: 1fr;
      }

      .header__title {
        font-size: 30px;
      }

      .search-form {
        flex-direction: column;
      }
    }

    /* Marketplace Panel */
    .panel {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      overflow: hidden;
      backdrop-filter: blur(20px);
    }

    .panel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .panel__brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .panel__icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      color: white;
    }

    .panel__icon--myntra {
      background: var(--gradient-myntra);
    }

    .panel__icon--meesho {
      background: var(--gradient-meesho);
    }

    .panel__name {
      font-weight: 600;
      font-size: 15px;
    }

    .panel__count {
      font-size: 12px;
      color: var(--text-muted);
      padding: 4px 10px;
      background: rgba(255,255,255,0.04);
      border-radius: 999px;
    }

    .panel__body {
      padding: 8px;
      max-height: 600px;
      overflow-y: auto;
    }

    .panel__body::-webkit-scrollbar {
      width: 4px;
    }

    .panel__body::-webkit-scrollbar-track {
      background: transparent;
    }

    .panel__body::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
    }

    .panel__empty {
      padding: 40px 20px;
      text-align: center;
      color: var(--text-muted);
      font-size: 13px;
    }

    /* Product Card */
    .product {
      padding: 14px 16px;
      border-radius: var(--radius-sm);
      transition: background 0.15s ease;
      border-bottom: 1px solid rgba(255,255,255,0.03);
    }

    .product:hover {
      background: var(--bg-card-hover);
    }

    .product:last-child {
      border-bottom: none;
    }

    .product__brand {
      font-size: 11px;
      font-weight: 600;
      color: var(--accent-violet);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .product__title {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 8px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product__meta {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .product__tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 500;
    }

    .product__tag--price {
      background: rgba(16, 185, 129, 0.1);
      color: var(--accent-emerald);
    }

    .product__tag--discount {
      background: rgba(236, 72, 153, 0.1);
      color: var(--accent-pink);
    }

    .product__tag--rating {
      background: rgba(245, 158, 11, 0.1);
      color: var(--accent-amber);
    }

    /* Appear animation */
    .product {
      animation: fadeIn 0.3s ease forwards;
      opacity: 0;
    }

    @keyframes fadeIn {
      to { opacity: 1; transform: translateY(0); }
      from { opacity: 0; transform: translateY(8px); }
    }

    /* Elapsed time */
    .elapsed {
      text-align: center;
      margin-top: 20px;
      font-size: 12px;
      color: var(--text-muted);
    }

    .footer {
      text-align: center;
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid var(--border-color);
      font-size: 12px;
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <div class="header__badge">🔍 Proof of Concept</div>
      <h1 class="header__title">Fashion Market<br>Signal Agent</h1>
      <p class="header__subtitle">Real-time product intelligence from Myntra &amp; Meesho powered by browser automation</p>
    </header>

    <!-- Search -->
    <section class="search-section" id="search-section">
      <form class="search-form" id="search-form">
        <input
          type="text"
          class="search-input"
          id="keyword-input"
          placeholder="Enter a fashion keyword... e.g. cotton kurti, silk saree, denim jacket"
          value="cotton kurti"
          autocomplete="off"
        >
        <button type="submit" class="search-btn" id="analyze-btn">
          <span class="btn-text">⚡ Analyze</span>
          <span class="spinner"></span>
          <span class="loading-text" style="display:none">Scraping…</span>
        </button>
      </form>
      <div class="status-bar" id="status-bar">
        <span class="pulse"></span>
        <span id="status-text">Launching browsers and collecting data…</span>
      </div>
      <div class="error-bar" id="error-bar"></div>
    </section>

    <!-- Results -->
    <div class="results-grid" id="results-grid">
      <!-- Myntra Panel -->
      <div class="panel">
        <div class="panel__header">
          <div class="panel__brand">
            <div class="panel__icon panel__icon--myntra">M</div>
            <span class="panel__name">Myntra</span>
          </div>
          <span class="panel__count" id="myntra-count">0 products</span>
        </div>
        <div class="panel__body" id="myntra-results">
          <div class="panel__empty">Results will appear here after analysis</div>
        </div>
      </div>

      <!-- Meesho Panel -->
      <div class="panel">
        <div class="panel__header">
          <div class="panel__brand">
            <div class="panel__icon panel__icon--meesho">Me</div>
            <span class="panel__name">Meesho</span>
          </div>
          <span class="panel__count" id="meesho-count">0 products</span>
        </div>
        <div class="panel__body" id="meesho-results">
          <div class="panel__empty">Results will appear here after analysis</div>
        </div>
      <!-- Flipkart Panel -->
      <div class="panel">
        <div class="panel__header">
          <div class="panel__brand">
            <div class="panel__icon panel__icon--flipkart" style="background: linear-gradient(135deg, #2874f0 0%, #ffe11b 100%); color: #000;">F</div>
            <span class="panel__name">Flipkart</span>
          </div>
          <span class="panel__count" id="flipkart-count">0 products</span>
        </div>
        <div class="panel__body" id="flipkart-results">
          <div class="panel__empty">Results will appear here after analysis</div>
        </div>
      </div>
    </div>

    <div class="elapsed" id="elapsed"></div>

    <footer class="footer">
      Fashion Market Signal Agent &mdash; POC v1.0 &mdash; Playwright + Express + TypeScript
    </footer>
  </div>

  <script>
    const form = document.getElementById('search-form');
    const input = document.getElementById('keyword-input');
    const btn = document.getElementById('analyze-btn');
    const statusBar = document.getElementById('status-bar');
    const statusText = document.getElementById('status-text');
    const errorBar = document.getElementById('error-bar');
    const elapsedEl = document.getElementById('elapsed');
    const myntraResults = document.getElementById('myntra-results');
    const meeshoResults = document.getElementById('meesho-results');
    const flipkartResults = document.getElementById('flipkart-results');
    const myntraCount = document.getElementById('myntra-count');
    const meeshoCount = document.getElementById('meesho-count');
    const flipkartCount = document.getElementById('flipkart-count');

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    function renderProducts(products, container, countEl) {
      if (!products || products.length === 0) {
        container.innerHTML = '<div class="panel__empty">No products found. The site layout may have changed.</div>';
        countEl.textContent = '0 products';
        return;
      }

      countEl.textContent = products.length + ' product' + (products.length !== 1 ? 's' : '');

      container.innerHTML = products.map((p, i) => {
        const delay = i * 60;
        return '<div class="product" style="animation-delay: ' + delay + 'ms">' +
          (p.brand && p.brand !== 'N/A'
            ? '<div class="product__brand">' + escapeHtml(p.brand) + '</div>'
            : '') +
          '<div class="product__title">' + escapeHtml(p.title || 'Untitled') + '</div>' +
          '<div class="product__meta">' +
            (p.price && p.price !== 'N/A'
              ? '<span class="product__tag product__tag--price">💰 ' + escapeHtml(p.price) + '</span>'
              : '') +
            (p.discount && p.discount !== 'N/A'
              ? '<span class="product__tag product__tag--discount">🏷️ ' + escapeHtml(p.discount) + '</span>'
              : '') +
            (p.rating && p.rating !== 'N/A'
              ? '<span class="product__tag product__tag--rating">⭐ ' + escapeHtml(p.rating) + '</span>'
              : '') +
          '</div>' +
        '</div>';
      }).join('');
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const keyword = input.value.trim();
      if (!keyword) return;

      // UI: loading state
      btn.classList.add('loading');
      btn.querySelector('.loading-text').style.display = 'inline';
      btn.disabled = true;
      statusBar.classList.add('visible');
      errorBar.classList.remove('visible');
      elapsedEl.textContent = '';
      statusText.textContent = 'Launching browsers and collecting data from Myntra & Meesho…';

      myntraResults.innerHTML = '<div class="panel__empty">⏳ Scraping Myntra…</div>';
      meeshoResults.innerHTML = '<div class="panel__empty">⏳ Scraping Meesho…</div>';
      flipkartResults.innerHTML = '<div class="panel__empty">⏳ Scraping Flipkart…</div>';
      myntraCount.textContent = '…';
      meeshoCount.textContent = '…';
      flipkartCount.textContent = '…';

      const startTime = Date.now();

      try {
        const response = await fetch('/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword }),
        });

        const data = await response.json();
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

        if (!response.ok) {
          throw new Error(data.message || 'Analysis failed');
        }

        renderProducts(data.myntra, myntraResults, myntraCount);
        renderProducts(data.meesho, meeshoResults, meeshoCount);
        renderProducts(data.flipkart, flipkartResults, flipkartCount);

        elapsedEl.textContent = '✓ Completed in ' + elapsed + 's — Keyword: "' + keyword + '"';
        statusBar.classList.remove('visible');
      } catch (err) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        errorBar.textContent = '❌ ' + err.message + ' (after ' + elapsed + 's)';
        errorBar.classList.add('visible');
        statusBar.classList.remove('visible');

        myntraResults.innerHTML = '<div class="panel__empty">Analysis failed</div>';
        meeshoResults.innerHTML = '<div class="panel__empty">Analysis failed</div>';
        flipkartResults.innerHTML = '<div class="panel__empty">Analysis failed</div>';
      } finally {
        btn.classList.remove('loading');
        btn.querySelector('.loading-text').style.display = 'none';
        btn.disabled = false;
      }
    });
  </script>
</body>
</html>`;
}
