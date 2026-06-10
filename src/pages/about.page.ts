import { BasePage } from '@pages/base.page';

export class AboutPage extends BasePage {
  private static readonly PATH = '/pages/about';

  override async navigate(): Promise<void> {
    await this.page.goto(
      this.url.replace(/\/$/, '') + AboutPage.PATH,
      { waitUntil: 'load' }
    );
    // Scroll to bottom to trigger intersection-observer lazy loading, then back to top
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  // About page has no H1 — returns first visible heading (h1 → h2 → h3)
  async getMainHeading(): Promise<string> {
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

  async hasOurStorySection(): Promise<boolean> {
    const el = this.page.locator('h1, h2, h3').filter({ hasText: /our story/i });
    return (await el.count()) > 0;
  }

  async hasWhyLocalMattersSection(): Promise<boolean> {
    const el = this.page.locator('h1, h2, h3').filter({ hasText: /why local matters/i });
    return (await el.count()) > 0;
  }

  async hasFounderContent(): Promise<boolean> {
    // Founder is Lisa Morrow
    const bodyText = await this.page.evaluate<string>(() => document.body.innerText);
    return /lisa morrow|founder/i.test(bodyText);
  }

  async hasArizonaContent(): Promise<boolean> {
    const bodyText = await this.page.evaluate<string>(() => document.body.innerText);
    return /arizona/i.test(bodyText);
  }

  async getBodyText(): Promise<string> {
    return this.page.evaluate<string>(() => document.body.innerText);
  }
}
