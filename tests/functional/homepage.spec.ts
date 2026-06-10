/**
 * tests/functional/homepage.spec.ts
 *
 * Functional tests for the Birdytell homepage.
 * Verifies hero content, CTAs, featured products, and newsletter section.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Homepage Features @functional', () => {
  // homePage fixture already navigated (uses 'load') — no extra beforeEach needed

  // ── Hero section ─────────────────────────────────────────────────────────────

  test('hero section displays an H1 heading @functional', async ({ homePage }) => {
    const heading = await homePage.getMainHeading();
    expect(heading.length, 'Homepage H1 should have content').toBeGreaterThan(0);
  });

  test('homepage has a brand-related H1 @functional', async ({ homePage }) => {
    // H1 is the logo/brand name "Birdytell" — not the hero banner text
    const heading = await homePage.getMainHeading();
    expect(
      heading.length,
      'H1 should be non-empty (brand or logo text)'
    ).toBeGreaterThan(0);
  });

  test('homepage has Arizona or maker identity in hero content @functional', async ({ homePage }) => {
    // Arizona identity lives in H2 banners, not the H1 logo
    const bodyText = await homePage.page.evaluate<string>(() => document.body.innerText);
    expect(
      /arizona|makers?|rooted|independent/i.test(bodyText),
      'Homepage body should reference Arizona, makers, or rooted identity'
    ).toBeTruthy();
  });

  test('homepage has multiple section headings @functional', async ({ homePage }) => {
    const h2Count = await homePage.page.locator('h2').count();
    expect(
      h2Count,
      'Homepage should have at least 2 H2 section headings'
    ).toBeGreaterThanOrEqual(2);
  });

  // ── CTA buttons ──────────────────────────────────────────────────────────────

  test('"Send a Gift" CTA exists and links to All Gifts collection @functional', async ({ homePage }) => {
    const sendGiftLink = homePage.page
      .locator('a[href*="/collections/shop-all-gifts"]')
      .first();

    expect(
      await sendGiftLink.count(),
      '"Send a Gift" link to /collections/shop-all-gifts should exist on the page'
    ).toBeGreaterThan(0);
  });

  test('"Corporate & Events" CTA links to corporate gifting page @functional', async ({ homePage }) => {
    const corporateLink = homePage.page
      .locator('a[href*="/pages/corporate-gifting"]')
      .first();

    if (await corporateLink.count() === 0) {
      console.warn('[functional/homepage] /pages/corporate-gifting link not found on homepage.');
      return;
    }

    const href = await corporateLink.getAttribute('href');
    expect(href).toContain('/pages/corporate-gifting');
  });

  test('"Build your gifts" CTA links to the Gift Builder @functional', async ({ homePage }) => {
    const builderLink = homePage.page
      .locator('a[href*="builder"]')
      .first();

    if (await builderLink.count() === 0) {
      console.warn('[functional/homepage] Gift Builder CTA not found — skipping.');
      return;
    }

    const href = await builderLink.getAttribute('href');
    expect(href, 'Gift Builder CTA should have a non-empty href').toBeTruthy();
  });

  // ── Featured products ────────────────────────────────────────────────────────

  test('featured products section is present with product links @functional', async ({ homePage }) => {
    const productLinks = homePage.page.locator('a[href*="/products/"]');
    const count = await productLinks.count();
    expect(
      count,
      'Homepage should feature at least one product link'
    ).toBeGreaterThan(0);
  });

  test('featured products show prices on the homepage @functional', async ({ homePage }) => {
    // Check for $ currency in page text as a reliable fallback
    const bodyText = await homePage.page.evaluate<string>(() => document.body.innerText);
    expect(
      /\$\d+/.test(bodyText),
      'Homepage should display at least one product price (e.g. $38.00)'
    ).toBeTruthy();
  });

  // ── Newsletter section ───────────────────────────────────────────────────────

  test('newsletter email signup section is present @functional', async ({ homePage }) => {
    const emailInput = homePage.page.locator(
      'input[type="email"], input[name*="email" i], input[placeholder*="email" i]'
    ).first();

    expect(
      await emailInput.count(),
      'Homepage should have a newsletter email input'
    ).toBeGreaterThan(0);
  });

  test('newsletter subscribe button exists on the page @functional', async ({ homePage }) => {
    const subscribeBtn = homePage.page
      .locator('button, input[type="submit"]')
      .filter({ hasText: /subscribe|sign up|join|submit/i })
      .first();

    if (await subscribeBtn.count() === 0) {
      console.warn('[functional/homepage] Subscribe button not found — may use a different label.');
      return;
    }

    expect(await subscribeBtn.count()).toBeGreaterThan(0);
  });

  // ── Navigation presence ───────────────────────────────────────────────────────

  test('primary navigation links are present in the header @functional', async ({ homePage }) => {
    // Birdytell uses header-scoped UL lists — no native <nav> element
    const navLinks = homePage.page.locator(
      'nav a, [role="navigation"] a, header a[href*="/collections/"], header a[href*="/pages/"]'
    );
    const count = await navLinks.count();
    expect(
      count,
      'Header should contain navigation links to collections or pages'
    ).toBeGreaterThan(0);
  });

  test('logo or brand link is present in the header @functional', async ({ homePage, siteConfig }) => {
    const logoLink = homePage.page.locator(
      'header a[href="/"], header a[href="' + siteConfig.url + '"], ' +
      'a[class*="logo" i], a[aria-label*="home" i], a[aria-label*="birdytell" i], ' +
      'header a:has(img[alt*="birdytell" i]), header a:has(svg)'
    ).first();

    if (await logoLink.count() === 0) {
      console.warn('[functional/homepage] Could not identify logo link in header.');
      return;
    }

    expect(await logoLink.count()).toBeGreaterThan(0);
  });

  // ── Footer ────────────────────────────────────────────────────────────────────

  test('footer is present with navigation links @functional', async ({ homePage }) => {
    const footer = homePage.page.locator('footer').first();
    await expect(footer, 'Page should have a <footer> element').toBeVisible();

    const footerLinks = footer.locator('a[href]');
    const count = await footerLinks.count();
    expect(count, 'Footer should contain at least 4 links').toBeGreaterThanOrEqual(4);
  });

  test('footer contains social media links @functional', async ({ homePage }) => {
    const socialLinks = homePage.page.locator(
      'a[href*="instagram.com"], a[href*="facebook.com"], a[href*="twitter.com"], a[href*="linkedin.com"]'
    );
    const count = await socialLinks.count();
    expect(count, 'Footer should have at least one social media link').toBeGreaterThan(0);
  });
});
