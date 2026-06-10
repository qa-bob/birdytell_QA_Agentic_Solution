import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export class FaqPage extends BasePage {
  private static readonly PATH = '/pages/faqs';

  override async navigate(): Promise<void> {
    await this.page.goto(
      this.url.replace(/\/$/, '') + FaqPage.PATH,
      { waitUntil: 'load' }
    );
    // Scroll to trigger lazy-loaded sections, then back to top
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async getPageHeading(): Promise<string> {
    const h1 = this.page.locator('h1').first();
    if (await h1.count() > 0) return (await h1.textContent())?.trim() ?? '';
    return '';
  }

  /**
   * Return the clickable accordion trigger elements.
   * Birdytell uses <details>/<summary> or button[aria-expanded] patterns.
   * Excludes nav-level toggles (hamburger buttons, etc.) from results.
   */
  async getAccordionTriggers(): Promise<Locator[]> {
    // Modern Shopify themes (Dawn, etc.) use <details>/<summary>
    // Only look in main content area — exclude header/nav hamburger toggles
    const summaries = this.page.locator('main details summary, [id*="content"] details summary, article details summary, details summary').filter({ hasNot: this.page.locator('header, nav, [role="navigation"]') });
    if (await summaries.count() > 0) return summaries.all();

    // Fallback: button-driven accordions — exclude nav and header toggles
    const buttons = this.page.locator('main button[aria-expanded], [id*="content"] button[aria-expanded], [class*="faq"] button[aria-expanded], [class*="accordion"] button[aria-expanded]');
    if (await buttons.count() > 0) return buttons.all();

    // Fallback: collapsible sections with JS-toggled classes
    const collapsible = this.page.locator(
      '[class*="collapsible"] [class*="trigger"], [class*="collapsible"] summary, ' +
      '[class*="accordion"] button, [class*="faq"] button'
    );
    if (await collapsible.count() > 0) return collapsible.all();

    return [];
  }

  async getQuestionCount(): Promise<number> {
    const triggers = await this.getAccordionTriggers();
    return triggers.length;
  }

  async clickTrigger(index: number): Promise<void> {
    const triggers = await this.getAccordionTriggers();
    if (index < triggers.length) {
      const trigger = triggers[index];
      // Only click if visible — skips hidden nav toggles or off-screen items
      if (await trigger.isVisible()) {
        await trigger.click();
      }
    }
  }

  /**
   * Returns true if the accordion item at the given index is currently expanded.
   * Handles both <details> open attribute and aria-expanded.
   */
  async isTriggerExpanded(index: number): Promise<boolean> {
    const triggers = await this.getAccordionTriggers();
    if (index >= triggers.length) return false;

    const trigger = triggers[index];
    const tagName = await trigger.evaluate<string>((el) => el.tagName.toLowerCase());

    if (tagName === 'summary') {
      return trigger.evaluate<boolean>((el) => {
        const details = el.closest('details');
        return details ? (details as HTMLDetailsElement).open : false;
      });
    }

    const expanded = await trigger.getAttribute('aria-expanded');
    return expanded === 'true';
  }

  /**
   * Return the answer text for the accordion item at the given index.
   * Assumes <details>/<summary> or a sibling/child answer container.
   */
  async getAnswerText(index: number): Promise<string> {
    const triggers = await this.getAccordionTriggers();
    if (index >= triggers.length) return '';

    const trigger = triggers[index];
    const tagName = await trigger.evaluate<string>((el) => el.tagName.toLowerCase());

    if (tagName === 'summary') {
      // Answer is the content of <details> other than the <summary>
      return trigger.evaluate<string>((el) => {
        const details = el.closest('details');
        if (!details) return '';
        const clone = details.cloneNode(true) as HTMLElement;
        clone.querySelector('summary')?.remove();
        return clone.textContent?.trim() ?? '';
      });
    }

    // button[aria-expanded]: answer is in aria-controls or next sibling
    const controlsId = await trigger.getAttribute('aria-controls');
    if (controlsId) {
      const panel = this.page.locator(`#${controlsId}`);
      if (await panel.count() > 0) return (await panel.textContent())?.trim() ?? '';
    }

    return '';
  }
}
