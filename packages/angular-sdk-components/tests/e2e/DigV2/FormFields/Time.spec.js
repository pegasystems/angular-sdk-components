const { test, expect } = require('@playwright/test');

const config = require('../../../config');
const common = require('../../../common');

// These values represent the data values used for the conditions and are initialised in pyDefault DT
const isDisabled = true;
const isVisible = true;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(config.config.baseUrl, { waitUntil: 'networkidle' });
});

test.describe('E2E test', () => {
  let attributes;

  test('should login, create case and run the Time tests', async ({ page }) => {
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

    /** Selecting TimeOnly from the Category dropdown */
    const selectedCategory = page.locator('mat-select[data-test-id="76729937a5eb6b0fd88c42581161facd"]');
    await selectedCategory.click();
    await page.getByRole('option', { name: 'TimeOnly' }).click();

    /** Selecting Required from the Sub Category dropdown */
    let selectedSubCategory = page.locator('mat-select[data-test-id="9463d5f18a8924b3200b56efaad63bda"]');
    await selectedSubCategory.click();
    await page.getByRole('option', { name: 'Required' }).click();

    await page.locator('button:has-text("submit")').click();

    await expect(page.locator('mat-error')).toBeVisible();

    /** Required tests */
    const requiredTime = page.locator('input[id="mat-input-2"]');
    const date = new Date();
    // Converting hours from 24 to 12 format, including the special case of "12"
    const time = `${(date.getHours() % 12) || 12}${date.getMinutes()}AM`;
    requiredTime.type(time);
    attributes = await common.getAttributes(requiredTime);
    await expect(attributes.includes('required')).toBeTruthy();

    await expect(page.locator('mat-error')).toBeHidden();

    const notRequiredTime = page.locator('input[id="mat-input-1"]');
    attributes = await common.getAttributes(notRequiredTime);
    await expect(attributes.includes('required')).toBeFalsy();

    /** Selecting Disable from the Sub Category dropdown */
    selectedSubCategory = page.locator('mat-select[data-test-id="9463d5f18a8924b3200b56efaad63bda"]');
    await selectedSubCategory.click();
    await page.getByRole('option', { name: 'Disable' }).click();

    // /** Disable tests */
    const alwaysDisabledTime = page.locator('input[id="mat-input-3"]');
    attributes = await common.getAttributes(alwaysDisabledTime);
    await expect(attributes.includes('disabled')).toBeTruthy();

    const conditionallyDisabledTime = page.locator('input[id="mat-input-4"]');
    attributes = await common.getAttributes(conditionallyDisabledTime);
    if (isDisabled) {
      await expect(attributes.includes('disabled')).toBeTruthy();
    } else {
      await expect(attributes.includes('disabled')).toBeFalsy();
    }

    const neverDisabledTime = page.locator('input[id="mat-input-5"]');
    attributes = await common.getAttributes(neverDisabledTime);
    await expect(attributes.includes('disabled')).toBeFalsy();

    /** Selecting Update from the Sub Category dropdown */
    selectedSubCategory = page.locator('mat-select[data-test-id="9463d5f18a8924b3200b56efaad63bda"]');
    await selectedSubCategory.click();
    await page.getByRole('option', { name: 'Update' }).click();

    /** Update tests */
    // const readonlyTime = page.locator(
    //   'input[data-test-id="084f8187169ed36f03937ecfd6e67087"]'
    // );
    // attributes = await common.getAttributes(readonlyTime);
    // await expect(attributes.includes('readonly')).toBeTruthy();

    const editableTime = page.locator('input[id="mat-input-6"]');
    editableTime.type(time);

    attributes = await common.getAttributes(editableTime);
    await expect(attributes.includes('readonly')).toBeFalsy();

    /** Selecting Visibility from the Sub Category dropdown */
    selectedSubCategory = page.locator('mat-select[data-test-id="9463d5f18a8924b3200b56efaad63bda"]');
    await selectedSubCategory.click();
    await page.getByRole('option', { name: 'Visibility' }).click();

    /** Visibility tests */
    await expect(page.locator('input[id="mat-input-7"]')).toBeVisible();

    const neverVisibleTime = await page.locator('input[data-test-id="971d3da425a39fac98652a85633db661"]');
    await expect(neverVisibleTime).not.toBeVisible();

    const conditionallyVisibleTime = await page.locator('input[id="mat-input-8"]');

    if (isVisible) {
      await expect(conditionallyVisibleTime).toBeVisible();
    } else {
      await expect(conditionallyVisibleTime).not.toBeVisible();
    }
  }, 10000);
});

test.afterEach(async ({ page }) => {
  await page.close();
});
