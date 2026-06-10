import { Router, Request, Response } from 'express';
import { scrapeMyntra } from '../scrapers/myntra';
import { scrapeMeesho } from '../scrapers/meesho';
import { scrapeFlipkart } from '../scrapers/flipkart';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

// Global timeout for the entire analysis operation
const ANALYSIS_TIMEOUT_MS = parseInt(process.env.SCRAPE_TIMEOUT_MS || '30000', 10) * 2;

interface AnalyzeRequest {
  keyword: string;
}

/**
 * POST /analyze
 *
 * Accepts a keyword, scrapes Myntra, Meesho, and Flipkart in parallel,
 * saves results to data/latest-results.json, and returns JSON.
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { keyword } = req.body as AnalyzeRequest;

  // Validate input
  if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'A non-empty "keyword" field is required in the request body.',
    });
    return;
  }

  const sanitizedKeyword = keyword.trim();
  const requestId = Date.now().toString(36);
  console.log(`\n[${'='.repeat(50)}]`);
  console.log(`[Analyze] Request ${requestId}: keyword="${sanitizedKeyword}"`);
  console.log(`[${'='.repeat(50)}]`);

  const startTime = Date.now();

  try {
    // Run all scrapers in parallel with a global timeout
    const analysisPromise = Promise.all([
      scrapeMyntra(sanitizedKeyword),
      scrapeMeesho(sanitizedKeyword),
      scrapeFlipkart(sanitizedKeyword),
    ]);

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Analysis timed out after ${ANALYSIS_TIMEOUT_MS}ms`)),
        ANALYSIS_TIMEOUT_MS
      )
    );

    const [myntra, meesho, flipkart] = await Promise.race([analysisPromise, timeoutPromise]);

    const result = {
      keyword: sanitizedKeyword,
      timestamp: new Date().toISOString(),
      myntra,
      meesho,
      flipkart,
    };

    // Save raw results to disk
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(
      path.join(dataDir, 'latest-results.json'),
      JSON.stringify(result, null, 2),
      'utf-8'
    );
    console.log(`[Analyze] Results saved to data/latest-results.json`);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `[Analyze] Request ${requestId} completed in ${elapsed}s — Myntra: ${myntra.length}, Meesho: ${meesho.length}, Flipkart: ${flipkart.length}`
    );

    res.json(result);
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Analyze] Request ${requestId} failed after ${elapsed}s:`, message);

    res.status(500).json({
      error: 'Analysis Failed',
      message,
      keyword: sanitizedKeyword,
      elapsed: `${elapsed}s`,
    });
  }
});

export { router as analyzeRouter };
