const { test, expect } = require('@playwright/test');

const config = require('../../../config');
const common = require('../../../common');

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3500/portal', { waitUntil: 'networkidle' });
});

test.describe('E2E test', () => {
  test('should login, create case and run different test cases for Data Reference', async ({ page }) => {
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

    /** Creating a Complex Fields case-type */
    const complexFieldsCase = page.locator('mat-list-item[id="case-list-item"] > span:has-text("Complex Fields")');
    await complexFieldsCase.click();

    /** Selecting Data Reference from the Category dropdown */
    const selectedCategory = page.locator('mat-select[data-test-id="76729937a5eb6b0fd88c42581161facd"]');
    await selectedCategory.click();
    await page.locator('mat-option >> span').getByText('DataReference', { exact: true }).click();

    await page.locator('button:has-text("submit")').click();

    /** Display subcategory tests */

    /** Autocomplete display type test */
    let selectedSubCategory = page.locator('mat-select[data-test-id="9463d5f18a8924b3200b56efaad63bda"]');
    await selectedSubCategory.click();
    await page.getByRole('option', { name: 'Display' }).click();

    let selectedTestName = page.locator('mat-select[data-test-id="6f64b45d01d11d8efd1693dfcb63b735"]');
    await selectedTestName.click();
    await page.getByRole('option', { name: 'Autocomplete' }).click();

    let selectedProduct = page.locator('input[role="combobox"]');
    await selectedProduct.click();
    await page.locator('mat-option:has-text("Basic Product")').click();

    await page.locator('button:has-text("Next")').click();

    let assignment = page.locator('app-default-form');

    /** Testing the values present on Confirm screen */
    await expect(assignment.locator('app-text >> div[class="psdk-data-readonly"]').getByText('Basic Product')).toBeVisible();
    //await expect(assignment.locator('app-text >> label').getByText("Basic Product")).toBeVisible();
    await expect(assignment.locator('app-text >> label').getByText('75')).toBeVisible();
    await expect(assignment.locator('app-text >> label').getByText('9f2584c2-5cb4-4abe-a261-d68050ee0f66')).toBeVisible();

    await page.locator('button:has-text("Previous")').click();

    /** Dropdown display type tests */
    selectedSubCategory = page.locator('mat-select[data-test-id="9463d5f18a8924b3200b56efaad63bda"]');
    await selectedSubCategory.click();
    await page.getByRole('option', { name: 'Display' }).click();

    selectedTestName = page.locator('mat-select[data-test-id="6f64b45d01d11d8efd1693dfcb63b735"]');
    await selectedTestName.click();
    await page.getByRole('option', { name: 'Dropdown' }).click();

    selectedProduct = page.getByLabel('Selected Product');
    //selectedProduct = page.locator('mat-select[role="combobox"]');
    await selectedProduct.click();
    await page.getByRole('option', { name: 'Basic Product' }).click();

    await page.locator('button:has-text("Next")').click();

    assignment = page.locator('app-default-form');

    /** Testing the values present on Confirm screen */
    await expect(assignment.locator('app-text >> div[class="psdk-data-readonly"]').getByText('Basic Product')).toBeVisible();
    //await expect(assignment.locator('app-text >> label').getByText("Basic Product")).toBeVisible();
    await expect(assignment.locator('app-text >> label').getByText('75')).toBeVisible();
    await expect(assignment.locator('app-text >> label').getByText('9f2584c2-5cb4-4abe-a261-d68050ee0f66')).toBeVisible();

    await page.locator('button:has-text("Previous")').click();

    /** Table display type tests */
    selectedSubCategory = page.locator('mat-select[data-test-id="9463d5f18a8924b3200b56efaad63bda"]');
    await selectedSubCategory.click();
    await page.getByRole('option', { name: 'Display' }).click();

    selectedTestName = page.locator('mat-select[data-test-id="6f64b45d01d11d8efd1693dfcb63b735"]');
    await selectedTestName.click();
    await page.getByRole('option', { name: 'Table' }).click();

    selectedProduct = page.locator('tr:has-text("Basic Product")');
    const selectedProductRow = selectedProduct.locator('td >> mat-radio-button');
    await selectedProductRow.click();

    await page.locator('button:has-text("Next")').click();

    assignment = page.locator('app-default-form');

    /** Testing the values present on Confirm screen */
    await expect(assignment.locator('app-text >> div[class="psdk-data-readonly"]').getByText('Basic Product')).toBeVisible();
    //await expect(assignment.locator('app-text >> label').getByText("Basic Product")).toBeVisible();
    await expect(assignment.locator('app-text >> label').getByText('75')).toBeVisible();
    await expect(assignment.locator('app-text >> label').getByText('9f2584c2-5cb4-4abe-a261-d68050ee0f66')).toBeVisible();

    await page.locator('button:has-text("Previous")').click();

    /** Options subcategory tests */

    /** SingleRecord options type test */
    selectedSubCategory = page.locator('mat-select[data-test-id="9463d5f18a8924b3200b56efaad63bda"]');
    await selectedSubCategory.click();
    await page.getByRole('option', { name: 'Options' }).click();

    selectedTestName = page.locator('mat-select[data-test-id="6f64b45d01d11d8efd1693dfcb63b735"]');
    await selectedTestName.click();
    await page.getByRole('option', { name: 'SingleRecord' }).click();

    selectedProduct = page.getByLabel('Selected Product');
    //selectedProduct = page.locator('input[id="mat-input-9"]');
    await selectedProduct.click();
    await page.getByRole('option', { name: 'Basic Product' }).click();

    await page.locator('button:has-text("Next")').click();

    assignment = page.locator('app-default-form');

    /** Testing the values present on Confirm screen */
    await expect(assignment.locator('app-text >> div[class="psdk-data-readonly"]').getByText('Basic Product')).toBeVisible();
    //await expect(assignment.locator('app-text >> label').getByText("Basic Product")).toBeVisible();
    await expect(assignment.locator('app-text >> label').getByText('75')).toBeVisible();
    await expect(assignment.locator('app-text >> label').getByText('9f2584c2-5cb4-4abe-a261-d68050ee0f66')).toBeVisible();

    await page.locator('button:has-text("Previous")').click();

    /** ListOfRecords options type test */
    selectedSubCategory = page.locator('mat-select[data-test-id="9463d5f18a8924b3200b56efaad63bda"]');
    await selectedSubCategory.click();
    await page.getByRole('option', { name: 'Options' }).click();

    selectedTestName = page.locator('mat-select[data-test-id="6f64b45d01d11d8efd1693dfcb63b735"]');
    await selectedTestName.click();
    await page.getByRole('option', { name: 'ListOfRecords' }).click();

    selectedProduct = page.locator('tr:has-text("Luxury Product")');
    const selectedProductTestRow = selectedProduct.locator('td >> mat-checkbox');
    await selectedProductTestRow.click();

    selectedProduct = page.locator('tr:has-text("Green Item")');
    const selectedProductTestSecondRow = selectedProduct.locator('td >> mat-checkbox');
    await selectedProductTestSecondRow.click();

    await page.locator('button:has-text("Next")').click();

    assignment = page.locator('app-default-form');

    /** Testing the values present on Confirm screen */
    await expect(assignment.locator('tr:has-text("Luxury Product")')).toBeVisible();
    await expect(assignment.locator('tr:has-text("Green Item")')).toBeVisible();

    await page.locator('button:has-text("Previous")').click();

    /** Mode subcategory tests */

    /** SingleSelect mode type test */
    selectedSubCategory = page.locator('mat-select[data-test-id="9463d5f18a8924b3200b56efaad63bda"]');
    await selectedSubCategory.click();
    await page.getByRole('option', { name: 'Mode' }).click();

    selectedTestName = page.locator('mat-select[data-test-id="6f64b45d01d11d8efd1693dfcb63b735"]');
    await selectedTestName.click();
    await page.getByRole('option', { name: 'SingleSelect' }).click();

    selectedProduct = page.getByLabel('Selected Product');
    //selectedProduct = page.locator('input[id="mat-input-6"]');
    await selectedProduct.click();
    await page.getByRole('option', { name: 'Basic Product' }).click();
    await expect(selectedProduct).toBeVisible();

    await page.locator('button:has-text("Next")').click();

    assignment = page.locator('app-default-form');

    /** Testing the values present on Confirm screen */
    await expect(assignment.locator('app-text >> div[class="psdk-data-readonly"]').getByText('Basic Product')).toBeVisible();
    //await expect(assignment.locator('app-text >> label').getByText("Basic Product")).toBeVisible();
    await expect(assignment.locator('app-text >> label').getByText('75')).toBeVisible();
    await expect(assignment.locator('app-text >> label').getByText('9f2584c2-5cb4-4abe-a261-d68050ee0f66')).toBeVisible();

    await page.locator('button:has-text("Previous")').click();

    /** Readonly mode type test */
    selectedSubCategory = page.locator('mat-select[data-test-id="9463d5f18a8924b3200b56efaad63bda"]');
    await selectedSubCategory.click();
    await page.getByRole('option', { name: 'Mode' }).click();

    selectedTestName = page.locator('mat-select[data-test-id="6f64b45d01d11d8efd1693dfcb63b735"]');
    await selectedTestName.click();
    await page.getByRole('option', { name: 'Readonly' }).click();

    selectedProduct = page.locator('app-data-reference >> app-semantic-link >> div >> div:has-text("Basic Product")');
    await expect(selectedProduct).toBeVisible();

    await page.locator('button:has-text("Next")').click();

    assignment = page.locator('app-default-form');

    /** Testing the values present on Confirm screen */
    await expect(assignment.locator('app-text >> div[class="psdk-data-readonly"]').getByText('Basic Product')).toBeVisible();
    //await expect(assignment.locator('app-text >> label').getByText("Basic Product")).toBeVisible();
    await expect(assignment.locator('app-text >> label').getByText('75')).toBeVisible();
    await expect(assignment.locator('app-text >> label').getByText('9f2584c2-5cb4-4abe-a261-d68050ee0f66')).toBeVisible();

    /** Submitting the case */
    await page.locator('button:has-text("submit")').click();
  }, 10000);
});

test.afterEach(async ({ page }) => {
  await page.close();
});
