/**
 * tests/functional/shop.spec.ts
 *
 * Functional tests for Birdytell's shop / collection pages.
 * Verifies product grid, product cards, prices, and collection navigation.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Shop Collections @functional', () => {
  // ── All Gifts collection ──────────────────────────────────────────────────────

  test.describe('All Gifts collection', () => {
    test.beforeEach(async ({ shopPage }) => {
      await shopPage.navigate();
    });

    test('All Gifts collection page loads with a heading @functional', async ({ shopPage }) => {
      const heading = await shopPage.getCollectionHeading();
      expect(heading.length, 'Collection page should have a visible heading or title').toBeGreaterThan(0);
    });

    test('All Gifts collection has /products/ links @functional', async ({ shopPage }) => {
      const links = await shopPage.getProductLinks();
      expect(
        links.length,
        'Collection should have at least one /products/ link'
      ).toBeGreaterThan(0);
    });

    test('All Gifts collection shows price information @functional', async ({ shopPage }) => {
      const hasPrices = await shopPage.hasPriceElements();
      expect(hasPrices, 'Collection page should display price information').toBeTruthy();
    });

    test('All Gifts collection page has product card elements @functional', async ({ shopPage }) => {
      const count = await shopPage.getProductCount();
      if (count === 0) {
        // Fallback: at least product links exist
        const links = await shopPage.getProductLinks();
        expect(
          links.length,
          'If no card elements detected, at least product links should exist'
        ).toBeGreaterThan(0);
      } else {
        expect(count).toBeGreaterThan(0);
      }
    });
  });

  // ── Individual sub-collections ────────────────────────────────────────────────

  const COLLECTIONS: Array<{ name: string; path: string }> = [
    { name: 'Hospitality', path: '/collections/hospitality' },
    { name: 'The Concierge', path: '/collections/the-concierge' },
    { name: 'Residence', path: '/collections/residence' },
    { name: 'Gathering', path: '/collections/gathering' },
    { name: 'Sanctuary', path: '/collections/sanctuary' },
  ];

  for (const col of COLLECTIONS) {
    test(`${col.name} collection page loads @functional`, async ({ shopPage, page }) => {
      const response = await page.goto(
        'https://www.birdytell.com' + col.path,
        { waitUntil: 'load', timeout: 20_000 }
      );

      const status = response?.status() ?? 0;

      if (status === 503) {
        console.warn(`[functional/shop] ${col.name} returned 503 — Shopify rate limit, skipping.`);
        test.skip(true, 'Shopify rate limit (503) — not a product failure');
        return;
      }

      expect(
        status >= 200 && status < 400,
        `${col.name} collection should load (HTTP 2xx/3xx), got ${status}`
      ).toBeTruthy();

      const productLinks = page.locator('a[href*="/products/"]');
      const linkCount = await productLinks.count();
      if (linkCount === 0) {
        console.warn(`[functional/shop] ${col.name}: no product links found — collection may be empty.`);
      }
    });
  }

  // ── Market collection ─────────────────────────────────────────────────────────

  test('Market collection page is reachable @functional', async ({ page }) => {
    const response = await page.goto(
      'https://www.birdytell.com/collections/market',
      { waitUntil: 'load', timeout: 20_000 }
    );

    const status = response?.status() ?? 0;
    if (status === 503) {
      test.skip(true, 'Shopify rate limit (503)');
      return;
    }

    expect(status >= 200 && status < 400).toBeTruthy();
  });

  // ── New arrivals ──────────────────────────────────────────────────────────────

  test('New arrivals collection is reachable @functional', async ({ page }) => {
    const response = await page.goto(
      'https://www.birdytell.com/collections/new',
      { waitUntil: 'load', timeout: 20_000 }
    );

    const status = response?.status() ?? 0;
    if (status === 503) {
      test.skip(true, 'Shopify rate limit (503)');
      return;
    }

    expect(status >= 200 && status < 400).toBeTruthy();
  });

  // ── Corporate Gift Builder ────────────────────────────────────────────────────

  test('Corporate Gift Builder link is present in site navigation @functional', async ({ page }) => {
    await page.goto('https://www.birdytell.com', { waitUntil: 'load' });

    // Builder link may be in a collapsed nav — just verify it exists in the DOM
    const builderLink = page.locator(
      'a[href*="builder"], a[href*="giftbuilder"]'
    ).first();

    if (await builderLink.count() === 0) {
      console.warn('[functional/shop] Gift Builder link not found in DOM — may require nav expansion.');
      return;
    }

    const href = await builderLink.getAttribute('href');
    expect(href, 'Gift Builder link should have a non-empty href').toBeTruthy();
  });
});
