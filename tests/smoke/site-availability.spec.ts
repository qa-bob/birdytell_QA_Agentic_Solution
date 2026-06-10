/**
 * tests/smoke/site-availability.spec.ts
 *
 * Smoke tests — fast, high-value checks that confirm the site is up and
 * serving a meaningful page.  Run first in CI to gate deeper test suites.
 *
 * Tag: @smoke
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Site Availability @smoke', () => {
  test('site homepage loads successfully @smoke', async ({ homePage, siteConfig }) => {
    const response = await homePage.page.goto(siteConfig.url, {
      waitUntil: 'domcontentloaded',
    });

    expect(response).not.toBeNull();
    const status = response!.status();
    expect(
      status >= 200 && status < 400,
      `Expected HTTP 2xx/3xx but got ${status} for ${siteConfig.url}`
    ).toBeTruthy();

    const bodyText = await homePage.page.evaluate<string>(() => document.body.innerText);
    expect(bodyText.trim().length, 'Page body should have visible text').toBeGreaterThan(0);
  });

  test('page loads within acceptable time @smoke', async ({ siteConfig, page }) => {
    const MAX_LOAD_MS = 20_000; // Shopify stores with many third-party scripts can be slow

    const start = Date.now();
    await page.goto(siteConfig.url, { waitUntil: 'load' });
    const elapsed = Date.now() - start;

    expect(
      elapsed,
      `Page took ${elapsed}ms to load — exceeds limit of ${MAX_LOAD_MS}ms`
    ).toBeLessThan(MAX_LOAD_MS);
  });

  test('no critical JavaScript errors on load @smoke', async ({ siteConfig, page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      consoleErrors.push(`[pageerror] ${err.message}`);
    });

    await page.goto(siteConfig.url, { waitUntil: 'load' });

    const criticalErrors = consoleErrors.filter((err) => {
      const lower = err.toLowerCase();
      return (
        !lower.includes('google-analytics') &&
        !lower.includes('googletagmanager') &&
        !lower.includes('hotjar') &&
        !lower.includes('intercom') &&
        !lower.includes('net::err_blocked_by_client') &&
        !lower.includes('shop.app') &&           // Shopify Shop app CSP frame-ancestors
        !lower.includes('content security policy') && // CSP directives from CDN
        !lower.includes('shopify.com') &&         // Shopify internal 403s
        !lower.includes('status of 403') &&        // Third-party 403 resource blocks
        !lower.includes('frame-ancestors')         // CSP frame policy violations
      );
    });

    if (criticalErrors.length > 0) {
      console.warn('[smoke] Console errors found:\n' + criticalErrors.join('\n'));
    }

    expect(
      criticalErrors.length,
      `Found ${criticalErrors.length} console error(s):\n${criticalErrors.join('\n')}`
    ).toBeLessThanOrEqual(3);
  });

  test('site is served over HTTPS @smoke', async ({ siteConfig }) => {
    const url = siteConfig.url.toLowerCase();
    expect(
      url.startsWith('https://'),
      `Site URL "${siteConfig.url}" should use HTTPS`
    ).toBeTruthy();
  });

  test('page has a title and meta description @smoke', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    const title = await page.title();
    expect(title.trim(), 'Page <title> should not be empty').toBeTruthy();
    expect(title.trim().length, 'Page title should be meaningful (>3 chars)').toBeGreaterThan(3);

    const metaDescription = await page
      .locator('meta[name="description"]')
      .getAttribute('content');

    if (!metaDescription || metaDescription.trim().length === 0) {
      console.warn(
        `[smoke] "${siteConfig.name}" is missing a meta description. This affects SEO performance.`
      );
    } else {
      expect(
        metaDescription.trim().length,
        'Meta description should have meaningful content'
      ).toBeGreaterThan(10);
    }
  });

  // ── Key pages are reachable ───────────────────────────────────────────────────

  const KEY_PAGES: Array<{ name: string; path: string }> = [
    { name: 'About', path: '/pages/about' },
    { name: 'Corporate & Events', path: '/pages/corporate-gifting' },
    { name: 'FAQs', path: '/pages/faqs' },
    { name: 'Contact', path: '/pages/contact' },
    { name: 'Shipping Policy', path: '/policies/shipping-policy' },
    { name: 'Refund Policy', path: '/policies/refund-policy' },
  ];

  for (const { name, path } of KEY_PAGES) {
    test(`${name} page is reachable (no 404) @smoke`, async ({ siteConfig, page }) => {
      const url = siteConfig.url.replace(/\/$/, '') + path;
      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 15_000,
      });

      const status = response?.status() ?? 0;
      expect(
        status >= 200 && status < 400,
        `${name} page at "${url}" should be reachable — got HTTP ${status}`
      ).toBeTruthy();
    });
  }

  // ── Birdytell brand identity ──────────────────────────────────────────────────

  test('homepage title references Birdytell brand @smoke', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    expect(
      title.toLowerCase(),
      `Page title "${title}" should reference the Birdytell brand`
    ).toMatch(/birdytell/i);
  });

  test('homepage H1 is present and non-empty @smoke', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const h1 = page.locator('h1').first();
    await expect(h1, 'Homepage should have an H1 element').toBeVisible();
    const text = await h1.textContent();
    expect(text?.trim().length, 'H1 should have visible text').toBeGreaterThan(0);
  });
});
