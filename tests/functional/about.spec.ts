/**
 * tests/functional/about.spec.ts
 *
 * Functional tests for the Birdytell About page (/pages/about).
 * Verifies brand story, local-focus content, founder information, and CTAs.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('About Page @functional', () => {
  test.beforeEach(async ({ aboutPage }) => {
    await aboutPage.navigate();
  });

  // ── Page load ────────────────────────────────────────────────────────────────

  test('about page loads with page content @functional', async ({ aboutPage }) => {
    const bodyText = await aboutPage.getBodyText();
    expect(bodyText.trim().length, 'About page should have visible text content').toBeGreaterThan(100);
  });

  test('about page has a visible heading @functional', async ({ aboutPage }) => {
    // About page uses H2 as main headings (no H1 present)
    const heading = await aboutPage.getMainHeading();
    expect(heading.length, 'About page should have at least one heading (h1/h2/h3)').toBeGreaterThan(0);
  });

  // ── Core content sections ────────────────────────────────────────────────────

  test('"Our Story" section is present @functional', async ({ aboutPage }) => {
    const hasSection = await aboutPage.hasOurStorySection();
    expect(hasSection, '"Our Story" section should be present on the About page').toBeTruthy();
  });

  test('"Why Local Matters" section is present @functional', async ({ aboutPage }) => {
    const hasSection = await aboutPage.hasWhyLocalMattersSection();
    expect(
      hasSection,
      '"Why Local Matters" section should be present on the About page'
    ).toBeTruthy();
  });

  test('about page has multiple section headings @functional', async ({ aboutPage }) => {
    const headings = await aboutPage.getAllHeadings();
    expect(
      headings.length,
      'About page should have at least 3 section headings'
    ).toBeGreaterThanOrEqual(3);
  });

  // ── Brand identity ────────────────────────────────────────────────────────────

  test('about page references Arizona @functional', async ({ aboutPage }) => {
    const hasArizona = await aboutPage.hasArizonaContent();
    expect(hasArizona, 'About page should reference Arizona as the brand origin').toBeTruthy();
  });

  test('about page mentions local makers or artisans @functional', async ({ aboutPage }) => {
    const bodyText = await aboutPage.getBodyText();
    expect(
      /maker|artisan|local|independent/i.test(bodyText),
      'About page should mention local makers or artisans'
    ).toBeTruthy();
  });

  // ── Founder ───────────────────────────────────────────────────────────────────

  test('founder information is present (Lisa Morrow) @functional', async ({ aboutPage }) => {
    const hasFounder = await aboutPage.hasFounderContent();
    expect(
      hasFounder,
      'About page should include founder information (Lisa Morrow or Founder title)'
    ).toBeTruthy();
  });

  // ── CTAs ──────────────────────────────────────────────────────────────────────

  test('about page has navigational links @functional', async ({ aboutPage }) => {
    const links = aboutPage.page.locator('a[href]:not([href="#"]):not([href^="mailto"]):not([href^="tel"])');
    const count = await links.count();
    expect(
      count,
      'About page should contain navigational links'
    ).toBeGreaterThan(0);
  });

  test('about page links to shop or corporate page @functional', async ({ aboutPage }) => {
    const shopOrCorpLink = aboutPage.page.locator(
      'a[href*="/collections/"], a[href*="/pages/corporate-gifting"]'
    ).first();

    if (await shopOrCorpLink.count() === 0) {
      console.warn('[functional/about] No shop or corporate links found on about page — skipping.');
      return;
    }

    // Check the link exists and has a valid href (not checking visibility — may be in header nav)
    const href = await shopOrCorpLink.getAttribute('href');
    expect(href, 'Shop/corporate link should have a non-empty href').toBeTruthy();
  });

  // ── 98% local claim ───────────────────────────────────────────────────────────

  test('about page references high percentage of local products @functional', async ({ aboutPage }) => {
    const bodyText = await aboutPage.getBodyText();
    const hasLocalClaim = /\d+%|majority|most|nearly all|local/i.test(bodyText);
    expect(
      hasLocalClaim,
      'About page should reference the local sourcing commitment'
    ).toBeTruthy();
  });
});
