/**
 * src/fixtures/site.fixture.ts
 *
 * Extends Playwright's base `test` with pre-constructed page objects and the
 * loaded site config.  All test files should import {test, expect} from here
 * instead of from '@playwright/test' directly.
 *
 * Usage in test files:
 *   import { test, expect } from '@fixtures/site.fixture';
 */

import { test as base, expect } from '@playwright/test';
import { loadSiteConfig, type SiteConfig } from '@site-types/site-config.types';
import { HomePage } from '@pages/home.page';
import { NavigationPage } from '@pages/navigation.page';
import { ContactFormPage } from '@pages/contact.page';
import { ShopPage } from '@pages/shop.page';
import { CorporatePage } from '@pages/corporate.page';
import { AboutPage } from '@pages/about.page';
import { FaqPage } from '@pages/faq.page';

// ── Fixture type definitions ─────────────────────────────────────────────────

export interface Fixtures {
  siteConfig: SiteConfig;
  homePage: HomePage;
  navigationPage: NavigationPage;
  contactPage: ContactFormPage;
  shopPage: ShopPage;
  corporatePage: CorporatePage;
  aboutPage: AboutPage;
  faqPage: FaqPage;
}

// ── Extended test object ─────────────────────────────────────────────────────

export const test = base.extend<Fixtures>({
  siteConfig: async ({}, use) => {
    const config = loadSiteConfig();
    await use(config);
  },

  homePage: async ({ page, siteConfig }, use) => {
    const homePage = new HomePage(page, siteConfig);
    await homePage.navigate();
    await use(homePage);
  },

  navigationPage: async ({ page, siteConfig }, use) => {
    const navigationPage = new NavigationPage(page, siteConfig);
    await use(navigationPage);
  },

  contactPage: async ({ page, siteConfig }, use) => {
    const contactPage = new ContactFormPage(page, siteConfig);
    await use(contactPage);
  },

  // ShopPage does NOT auto-navigate — tests call navigate() or navigateToCollection()
  shopPage: async ({ page, siteConfig }, use) => {
    const shopPage = new ShopPage(page, siteConfig);
    await use(shopPage);
  },

  // CorporatePage does NOT auto-navigate
  corporatePage: async ({ page, siteConfig }, use) => {
    const corporatePage = new CorporatePage(page, siteConfig);
    await use(corporatePage);
  },

  // AboutPage does NOT auto-navigate
  aboutPage: async ({ page, siteConfig }, use) => {
    const aboutPage = new AboutPage(page, siteConfig);
    await use(aboutPage);
  },

  // FaqPage does NOT auto-navigate
  faqPage: async ({ page, siteConfig }, use) => {
    const faqPage = new FaqPage(page, siteConfig);
    await use(faqPage);
  },
});

export { expect };
