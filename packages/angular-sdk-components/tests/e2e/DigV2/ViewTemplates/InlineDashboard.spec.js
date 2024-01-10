const { test, expect } = require('@playwright/test');
const config = require('../../../config');
const common = require('../../../common');
const endpoints = require('../../../../../../sdk-config.json');

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1720, height: 1080 });
  await page.goto(config.config.baseUrl, { waitUntil: 'networkidle' });
});

test.describe('E2E test', () => {
  test('should login, create case and run different test cases for Inline Dashboard template', async ({ page }) => {
    await common.login(config.config.apps.digv2.user.username, config.config.apps.digv2.user.password, page);

    /** Testing announcement banner presence */
    const announcementBanner = await page.locator('h2:has-text("Announcements")');
    await expect(announcementBanner).toBeVisible();

    /** Testing worklist presence */
    const worklist = page.locator('div[id="worklist"]:has-text("My Worklist")');
    await expect(worklist).toBeVisible();

    /** Hovering over navbar */
    const navbar = page.locator('app-navbar');
    await navbar.locator('div[class="psdk-appshell-nav"]').hover();

    /** Click on the Create Case button */
    const createCase = page.locator('mat-list-item[id="create-case-button"]');
    await createCase.click();

    /** Creating a Complex Fields case-type */
    const complexFieldsCase = page.locator('mat-list-item[id="case-list-item"] > span:has-text("Complex Fields")');
    await complexFieldsCase.click();

    const selectedCategory = page.locator('mat-select[data-test-id="76729937a5eb6b0fd88c42581161facd"]');
    await selectedCategory.click();
    await page.locator('mat-option >> span').getByText('DataReference', { exact: true }).click();

    const caseID = await page.locator('div[id="caseId"]').textContent();

    await page.locator('button:has-text("submit")').click();

    await page.locator('button:has-text("Next")').click();

    const inlineDashboard = page.locator('mat-list-item > span:has-text("Inline Dashboard")');
    await inlineDashboard.click();

    const complexFieldsListApiUrl = `${endpoints.serverConfig.infinityRestServerUrl}${
      endpoints.serverConfig.appAlias ? `/app/${endpoints.serverConfig.appAlias}` : ''
    }/api/application/v2/data_views/D_ComplexFieldsList`;

    await Promise.all([page.waitForResponse(complexFieldsListApiUrl)]);

    const inlineDashboardTitle = page.locator('h4:has-text("Inline Dashboard")');
    inlineDashboardTitle.click();
    await expect(inlineDashboardTitle).toBeVisible();

    /** Testing Complex Fields list presence */
    const complexFieldsList = page.locator('span:has-text("Complex  Fields - List")');
    await expect(complexFieldsList).toBeVisible();

    /** Testing My Work List presence */
    const myworkList = page.locator('span:has-text("My Work List")');
    await expect(myworkList).toBeVisible();

    /* Testing the filters */
    const filters = await page.locator('div[id="filters"]');
    const caseIdInput = filters.getByLabel('Case ID');
    await caseIdInput.click();
    await caseIdInput.fill(caseID);

    await Promise.all([page.waitForResponse(complexFieldsListApiUrl)]);

    await expect(page.locator(`td >> text=${caseID} >> nth=1`)).toBeVisible();
    await expect(page.locator('td >> text="Complex  Fields" >> nth=1')).toBeVisible();
    await expect(page.locator('td >> text="User DigV2"')).toBeVisible();
    await expect(page.locator('td >> text="New" >> nth=1')).toBeVisible();

    const today = new Date();
    // Seeing issues with today's date, so changed it to yesterday
    const yesterday = common.getFormattedDate(new Date(today.setDate(today.getDate() - 1)));
    const nextDay = common.getFormattedDate(new Date(today.setDate(today.getDate() + 1)));
    const dateFilter = filters.locator('div:has-text("Create date/time")');
    let dateFilterInput = dateFilter.locator('input[formcontrolname="start"]');
    await dateFilterInput.click();
    await dateFilterInput.pressSequentially(`${yesterday}`);
    dateFilterInput = dateFilter.locator('input[formcontrolname="end"]');
    await dateFilterInput.click();
    await dateFilterInput.pressSequentially(`${nextDay}`);

    await Promise.all([page.waitForResponse(complexFieldsListApiUrl), complexFieldsList.click()]);

    await expect(page.locator(`td:has-text("${new Date().getDate()}") >> nth=1`)).toBeVisible();

    await filters.locator('button:has-text("Clear All")').click();

    await expect(await caseIdInput.inputValue()).toEqual('');
  }, 10000);
});

test.afterEach(async ({ page }) => {
  await page.close();
});
