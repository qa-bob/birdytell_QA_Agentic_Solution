import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export class ShopPage extends BasePage {
  // Default collection path
  private static readonly DEFAULT_COLLECTION = '/collections/shop-all-gifts';

  override async navigate(): Promise<void> {
    await this.navigateToCollection(ShopPage.DEFAULT_COLLECTION);
  }

  async navigateToCollection(path: string): Promise<void> {
    await this.page.goto(
      this.url.replace(/\/$/, '') + path,
      { waitUntil: 'load' }
    );
  }

  // Shopify collection pages may not have a visible H1 — fall back to H2 or page title
  async getCollectionHeading(): Promise<string> {
    for (const tag of ['h1', 'h2']) {
      const el = this.page.locator(tag).first();
      if (await el.count() > 0) {
        const text = (await el.textContent())?.trim();
        if (text) return text;
      }
    }
    return this.page.title();
  }

  // Product cards: use /products/ links as the anchor for card detection
  private getCardLocator(): Locator {
    return this.page.locator(
      '.card-wrapper, .product-card, [data-product-card], article:has(a[href*="/products/"]), ' +
      'li.grid__item:has(a[href*="/products/"]), li:has(a[href*="/products/"])'
    );
  }

  async getProductCards(): Promise<Locator[]> {
    const cards = this.getCardLocator();
    if (await cards.count() > 0) return cards.all();
    return [];
  }

  async getProductCount(): Promise<number> {
    const cards = await this.getProductCards();
    return cards.length;
  }

  async getFirstProductTitle(): Promise<string> {
    const cards = await this.getProductCards();
    if (cards.length === 0) return '';
    const titleEl = cards[0].locator(
      'h2, h3, h4, .card__heading, [class*="heading"], [class*="title"], [class*="name"]'
    ).first();
    if (await titleEl.count() > 0) return (await titleEl.textContent())?.trim() ?? '';
    return '';
  }

  async hasPriceElements(): Promise<boolean> {
    // Shopify prices — check for $ or £ currency pattern in visible text as final fallback
    const priceEl = this.page.locator(
      '.price, .price__regular, .price-item, [class*="price"], .money, ' +
      'span:has-text("$"), [data-price]'
    ).first();
    if (await priceEl.count() > 0) return true;
    // Text fallback: look for $ in page content
    const bodyText = await this.page.evaluate<string>(() => document.body.innerText);
    return /\$\d+/.test(bodyText);
  }

  async hasSortOrFilterControls(): Promise<boolean> {
    const controls = this.page.locator(
      'select[name*="sort" i], [class*="sort"], [class*="filter"], ' +
      '[id*="sort" i], [id*="filter" i], button[aria-label*="filter" i]'
    );
    return (await controls.count()) > 0;
  }

  // All product links found on the collection page
  async getProductLinks(): Promise<string[]> {
    const anchors = this.page.locator('a[href*="/products/"]');
    const count = await anchors.count();
    const hrefs: string[] = [];
    for (let i = 0; i < count; i++) {
      const href = await anchors.nth(i).getAttribute('href');
      if (href) hrefs.push(href);
    }
    return [...new Set(hrefs)];
  }
}
