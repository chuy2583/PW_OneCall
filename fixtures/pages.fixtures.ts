import { test as base, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { RequestPage } from "../pages/RequestPage";

type Pages = {
    homePage: HomePage;
    requestPage: RequestPage;
}

export const test = base.extend<Pages>({
    homePage: async ({ page }, use) => {
        await use(new HomePage(page));
    },
    requestPage: async ({ page }, use) => {
        await use(new RequestPage(page));
    }
}); 

export { expect };