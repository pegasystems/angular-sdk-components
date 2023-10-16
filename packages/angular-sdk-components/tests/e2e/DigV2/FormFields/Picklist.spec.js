const { test, expect } = require('@playwright/test');

const config = require('../../../config');
const common = require('../../../common');

// These values represent the data values used for the conditions and are initialised in pyDefault DT
const isDisabled = true;
const isVisible = true;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3500/portal', { waitUntil: 'networkidle' });
});

test.describe('E2E test', () => {
  let attributes;

  test('should login, create case and run the Email tests', async ({ page }) => {
    await common.Login(config.config.apps.digv2.user.username, config.config.apps.digv2.user.password, page);

    /** Testing announcement banner presence */
    const announcementBanner = page.locator('h2:has-text("Announcements")');
    await expect(announcementBanner).toBeVisible();

    /** Testing worklist presence */
    const worklist = page.locator('div[id="worklist"]:has-text("My Worklist")');
    await expect(worklist).toBeVisible();

    /** Click on the Create Case button */
    let createCase = page.locator('mat-list-item[id="create-case-button"]');
    await createCase.click();

    /** Creating a Form Field case-type */
    const formFieldCase = page.locator('mat-list-item[id="case-list-item"] > span:has-text("Form Field")');
    await formFieldCase.click();

    /** Selecting PickList from the Category dropdown */
    const selectedCategory = page.locator('mat-select[data-test-id="76729937a5eb6b0fd88c42581161facd"]');
    await selectedCategory.click();
    await page.getByRole('option', { name: 'PickList' }).click();

    /** Selecting Required from the Sub Category dropdown */
    let selectedSubCategory = page.locator('mat-select[data-test-id="9463d5f18a8924b3200b56efaad63bda"]');
    await selectedSubCategory.click();
    await page.getByRole('option', { name: 'DataPage' }).click();

    /** Dropdown tests */
    let picklistAs = page.locator('mat-select[data-test-id="683ea3aece0dce7e065d31d43f1c269b"]');
    await picklistAs.click();
    await page.getByRole('option', { name: 'Dropdown' }).click();

    let dropdown = page.locator('mat-select[data-test-id="94cb322b7468c7827d336398e525827e"]');
    await dropdown.click();
    await page.getByRole('option', { name: 'Massachusetts' }).click();

    /** Autocomplete tests */
    await picklistAs.click();
    await page.getByRole('option', { name: 'AutoComplete' }).click();

    const autocomplete = page.locator('input[data-test-id="ed90c4ad051fd65a1d9f0930ec4b2276"]');
    await autocomplete.click();
    await page.locator('mat-option:has-text("Colorado")').click();

    /** Radiobutton tests */
    await picklistAs.click();
    await page.getByRole('option', { name: 'RadioButtons' }).click();

    const radiobutton = page.locator('mat-radio-group[data-test-id="b33340542f8f3efd4e91279520a197cf"]');
    const requiredDateInput = radiobutton.locator('mat-radio-button >> nth=0');
    await requiredDateInput.click();

    const radiobutton2 = page.locator('mat-radio-group[data-test-id="9649dad0b2aee94bc3250d26162cb593"]');
    const requiredDateInput2 = radiobutton2.locator('mat-radio-button >> nth=1');
    await requiredDateInput2.click();

    await page.locator('button:has-text("submit")').click();
  }, 10000);
});

test.afterEach(async ({ page }) => {
  await page.close();
});
