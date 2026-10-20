import { Page } from "@playwright/test";

export abstract class BasePage {
  /**
   * Stores the Playwright page used by every page object that extends this class.
   */
  constructor(protected page: Page) {}

  /**
   * Navigates to the given path, relative to the configured baseURL.
   * Calling it without arguments opens the baseURL itself.
   *
   * @param path - Path to open, for example "/rfq". Defaults to "".
   */
  async goto(path = ""): Promise<void> {
    await this.page.goto(path);
  }
}
