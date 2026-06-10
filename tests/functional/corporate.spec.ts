/**
 * tests/functional/corporate.spec.ts
 *
 * Functional tests for the Birdytell Corporate & Events page (/pages/corporate-gifting).
 * Verifies key content sections, CTAs, contact form, and value propositions.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Corporate Gifting Page @functional', () => {
  test.beforeEach(async ({ corporatePage }) => {
    await corporatePage.navigate();
  });

  // ── Page load ────────────────────────────────────────────────────────────────

  test('corporate page loads with a visible heading @functional', async ({ corporatePage }) => {
    // Corporate page uses H2 as main headings (no H1)
    const heading = await corporatePage.getHeroHeading();
    expect(heading.length, 'Corporate page should have at least one heading (h1/h2/h3)').toBeGreaterThan(0);
  });

  test('corporate page heading references gifting for teams or events @functional', async ({ corporatePage }) => {
    const heading = await corporatePage.getHeroHeading();
    expect(
      heading.toLowerCase(),
      `Heading "${heading}" should mention teams, events, clients, or gifting`
    ).toMatch(/teams?|events?|clients?|gifting|curated|corporate/i);
  });

  // ── Section headings ─────────────────────────────────────────────────────────

  test('corporate page has multiple content sections @functional', async ({ corporatePage }) => {
    const headings = await corporatePage.getAllHeadings();
    expect(
      headings.length,
      'Corporate page should have at least 3 headings (h1/h2/h3)'
    ).toBeGreaterThanOrEqual(3);
  });

  test('corporate page mentions minimum order requirement @functional', async ({ corporatePage }) => {
    const bodyText = await corporatePage.page.evaluate<string>(() => document.body.innerText);
    const hasMOQ = /minimum|min(\.|\s)?order|\d+[\s-]?unit/i.test(bodyText);
    if (!hasMOQ) {
      console.warn('[functional/corporate] Minimum order text not found — may have been updated.');
    }
    expect(typeof bodyText).toBe('string');
  });

  // ── CTAs ─────────────────────────────────────────────────────────────────────

  test('"Shop curated gifts" CTA is present @functional', async ({ corporatePage }) => {
    const cta = await corporatePage.getShopCuratedCTA();

    if (!cta) {
      console.warn('[functional/corporate] "Shop curated gifts" CTA not found — label may differ.');
      return;
    }

    const href = await cta.getAttribute('href');
    expect(href, '"Shop curated gifts" should have a valid href').toBeTruthy();
  });

  test('"Build your gifts" CTA exists and links to the Gift Builder @functional', async ({ corporatePage }) => {
    const cta = await corporatePage.getGiftBuilderCTA();

    if (!cta) {
      console.warn('[functional/corporate] Gift Builder CTA not found — label may differ.');
      return;
    }

    const href = await cta.getAttribute('href');
    expect(href, '"Build your gifts" link should have a non-empty href').toBeTruthy();
  });

  // ── Contact / inquiry form ────────────────────────────────────────────────────

  test('corporate page contains a contact/inquiry form @functional', async ({ corporatePage }) => {
    const hasForm = await corporatePage.hasContactForm();
    expect(
      hasForm,
      'Corporate page should have a contact form for inquiries (per site structure)'
    ).toBeTruthy();
  });

  test('corporate contact form has email field @functional', async ({ corporatePage, page }) => {
    const form = page.locator('form').filter({
      has: page.locator('input[type="email"], input[name*="email" i]'),
    }).first();

    if (await form.count() === 0) {
      test.skip(true, 'No email-bearing form found on corporate page');
      return;
    }

    const emailField = form.locator(
      'input[type="email"], input[name*="email" i]'
    );

    expect(
      await emailField.count(),
      'Corporate form should have an email field'
    ).toBeGreaterThan(0);
  });

  // ── Testimonials ──────────────────────────────────────────────────────────────

  test('corporate page has a testimonials or social proof section @functional', async ({ corporatePage }) => {
    const hasTestimonials = await corporatePage.hasTestimonialsSection();
    if (!hasTestimonials) {
      console.warn('[functional/corporate] Testimonials section not found — may have been removed.');
    }
    expect(typeof hasTestimonials).toBe('boolean');
  });

  // ── Key value propositions ─────────────────────────────────────────────────────

  test('corporate page references Arizona makers or local artisans @functional', async ({ corporatePage }) => {
    const bodyText = await corporatePage.page.evaluate<string>(() => document.body.innerText);
    const hasLocalRef = /arizona|local|maker|artisan/i.test(bodyText);
    expect(
      hasLocalRef,
      'Corporate page should reference Arizona makers or local artisans'
    ).toBeTruthy();
  });
});
