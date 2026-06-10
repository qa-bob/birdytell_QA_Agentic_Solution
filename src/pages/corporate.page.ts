import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export class CorporatePage extends BasePage {
  private static readonly PATH = '/pages/corporate-gifting';

  override async navigate(): Promise<void> {
    await this.page.goto(
      this.url.replace(/\/$/, '') + CorporatePage.PATH,
      { waitUntil: 'load' }
    );
  }

  // Corporate page has no H1 — returns first visible heading (h1 → h2 → h3)
  async getHeroHeading(): Promise<string> {
    for (const tag of ['h1', 'h2', 'h3']) {
      const el = this.page.locator(tag).first();
      if (await el.count() > 0) {
        const text = (await el.textContent())?.trim();
        if (text) return text;
      }
    }
    return '';
  }

  async getAllHeadings(): Promise<string[]> {
    const headings = this.page.locator('h1, h2, h3');
    const count = await headings.count();
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await headings.nth(i).textContent())?.trim();
      if (text) results.push(text);
    }
    return results;
  }

  // "Shop curated gifts" CTA
  async getShopCuratedCTA(): Promise<Locator | null> {
    const btn = this.page.getByRole('link', { name: /shop curated gifts/i }).first();
    if (await btn.count() > 0) return btn;
    return null;
  }

  // "Build your gifts" / Gift Builder CTA
  async getGiftBuilderCTA(): Promise<Locator | null> {
    const btn = this.page
      .locator('a')
      .filter({ hasText: /build your gifts|build something|gift builder/i })
      .first();
    if (await btn.count() > 0) return btn;
    return null;
  }

  async hasContactForm(): Promise<boolean> {
    const form = this.page.locator('form').filter({
      has: this.page.locator('input[type="email"], input[name*="email" i]'),
    });
    return (await form.count()) > 0;
  }

  async hasTestimonialsSection(): Promise<boolean> {
    const testimonials = this.page.locator(
      '[class*="testimonial"], [class*="review"], blockquote'
    );
    if (await testimonials.count() > 0) return true;

    // Also check for a heading that says "Testimonials"
    const heading = this.page.locator('h2, h3').filter({ hasText: /testimonials/i });
    return (await heading.count()) > 0;
  }

  async getMinimumOrderText(): Promise<string> {
    // Corporate page mentions "12-unit minimum"
    const bodyText = await this.page.evaluate<string>(() => document.body.innerText);
    const match = bodyText.match(/\d+[-\s]?unit minimum|\$\d+ minimum order|minimum order/i);
    return match ? match[0] : '';
  }
}
