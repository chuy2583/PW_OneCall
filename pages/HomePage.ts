import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
    readonly requestButton: Locator;

    /**
     * Creates the home page object and defines the "Request Quote" link locator.
     */
    constructor(page: Page) {
        super(page);
        this.requestButton = page.getByRole('link', {name: 'Request Quote'});
    }

    /**
     * Clicks the first "Request Quote" link and waits for the DOM of the
     * destination page to load, so the next step can interact with it.
     */
    async clickRequestButton(): Promise<void> {
        await this.requestButton.first().click();
        await this.page.waitForLoadState('domcontentloaded');
    }
}