import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export type ServiceName =
  | "warehousing"
  | "manufacturing"
  | "transportation"
  | "supplyChain"
  | "valueAdded"
  | "technology";

// Values of the "Industry" select (the empty placeholder option is excluded).
export type Industry =
  | "ecommerce"
  | "healthcare"
  | "automotive"
  | "technology"
  | "consumer-goods"
  | "food-beverage"
  | "other";

// Values of the "Timeline" select (the empty placeholder option is excluded).
export type Timeline =
  | "immediate"
  | "1-3-months"
  | "3-6-months"
  | "6-plus-months"
  | "flexible";

export interface RequestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  industry: Industry;
  services: ServiceName[];
  timeline: Timeline;
  volume?: string;
  details: string;
}

export class RequestPage extends BasePage {
  //#region Locator Declaration
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly companyInput: Locator;
  readonly industrySelect: Locator;
  readonly services: Record<ServiceName, Locator>;
  readonly timelineSelect: Locator;
  readonly volumeInput: Locator;
  readonly detailsInput: Locator;
  readonly submitButton: Locator;
 //#endregion

  /**
   * Creates the page object and defines all locators used by the Request Quote form.
   * Locators are lazy: they are resolved only when an action or assertion uses them.
   */
  constructor(page: Page) {
    super(page);

    // Contact Information
    this.firstNameInput = page.getByRole("textbox", { name: "First Name" });
    this.lastNameInput = page.getByRole("textbox", { name: "Last Name" });
    this.emailInput = page.getByRole("textbox", { name: "Email Address" });
    this.phoneInput = page.getByRole("textbox", { name: "Phone Number" });

    // Company Information
    this.companyInput = page.getByRole("textbox", { name: "Company Name" });
    this.industrySelect = page.getByRole("combobox", { name: "Industry" });

    // Service Requirements (custom checkboxes rendered as role="checkbox" buttons)
    this.services = {
      warehousing: page.getByRole("checkbox", {
        name: "Warehousing & Storage",
      }),
      manufacturing: page.getByRole("checkbox", {
        name: "Manufacturing Services",
      }),
      transportation: page.getByRole("checkbox", {
        name: "Transportation & Distribution",
      }),
      supplyChain: page.getByRole("checkbox", {
        name: "Supply Chain Management",
      }),
      valueAdded: page.getByRole("checkbox", { name: "Value-Added Services" }),
      technology: page.getByRole("checkbox", {
        name: "Technology Integration",
      }),
    };
    this.timelineSelect = page.getByRole("combobox", { name: "Timeline" });
    this.volumeInput = page.getByRole("textbox", {
      name: "Estimated Monthly Volume",
    });
    this.detailsInput = page.getByRole("textbox", { name: "Project Details" });

    this.submitButton = page.getByRole("button", { name: "Submit Request" });
  }

  /**
   * Checks the requested services. The custom checkboxes ignore clicks until the
   * page scripts have hydrated, so each click is retried until aria-checked is true.
   *
   * @param services - The services to select.
   */
  async selectServices(services: ServiceName[]): Promise<void> {
    for (const service of services) {
      const checkbox = this.services[service];
      await expect(async () => {
        if (!(await checkbox.isChecked())) {
          await checkbox.click();
        }
        await expect(checkbox).toBeChecked({ timeout: 1000 });
      }).toPass();
    }
  }

  /**
   * Fills every field of the Request Quote form with the given data.
   * Selects the requested services and only fills the optional volume field
   * when a value is provided.
   *
   * @param data - The values to enter in the form.
   */
  async fillRequestForm(data: RequestData): Promise<void> {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.companyInput.fill(data.company);
    await this.industrySelect.selectOption(data.industry);

    await this.selectServices(data.services);

    await this.timelineSelect.selectOption(data.timeline);
    if (data.volume) {
      await this.volumeInput.fill(data.volume);
    }
    await this.detailsInput.fill(data.details);
  }

  /**
   * Clicks the "Submit Request" button and returns the message of the
   * confirmation alert shown by the page. The alert is dismissed as soon as it
   * appears, so the click can complete. Rejects if no alert shows up in time.
   *
   * @param timeoutMs - How long to wait for the alert before failing.
   * @returns The text of the dialog displayed after submitting.
   */
  async submitForm(timeoutMs = 10_000): Promise<string> {
    const dialogMessage = new Promise<string>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`No confirmation dialog appeared within ${timeoutMs} ms`)),
        timeoutMs
      );
      this.page.once("dialog", async (dialog) => {
        clearTimeout(timer);
        try {
          resolve(dialog.message());
          await dialog.dismiss();
        } catch (error) {
          reject(error);
        }
      });
    });

    try {
      await this.submitButton.click();
    } catch (error) {
      // Avoid an unhandled rejection from the pending dialog promise.
      dialogMessage.catch(() => {});
      throw error;
    }
    return dialogMessage;
  }
}
