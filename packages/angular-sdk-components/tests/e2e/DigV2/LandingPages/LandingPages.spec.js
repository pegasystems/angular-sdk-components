const { test, expect } = require('@playwright/test');

const config = require('../../../config');
const common = require('../../../common');
// const endpoints = require('../../../../../../sdk-config.json');

test.beforeEach(common.launchPortal);

test.describe('E2E test', () => {
  test('should login, create case and run different test cases for My Work landing page', async ({ page }) => {
    await common.login(config.config.apps.digv2.user.username, config.config.apps.digv2.user.password, page);

    /** Testing announcement banner presence */
    const announcementBanner = page.locator('h2:has-text("Announcements")');
    await expect(announcementBanner).toBeVisible();

    /** Testing worklist presence */
    const worklist = page.locator('div[id="worklist"]:has-text("My Worklist")');
    await expect(worklist).toBeVisible();

    /** Click on the Create Case button */
    const createCase = page.locator('mat-list-item[id="create-case-button"]');
    await createCase.click();

    /** Creating a View Templates case-type */
    const viewTemplatesCase = page.locator('mat-list-item[id="case-list-item"] > span:has-text("View Templates")');
    await viewTemplatesCase.click();

    /** Extract caseID from CaseView */
    const caseID = await page.locator('div[id="caseId"]').textContent();

    /** Click on the `MyWork` landing page */
    const myWorkLandingPage = page.locator('mat-list-item > span:has-text("My Work")');
    await myWorkLandingPage.click();

    await page.locator('input[id="mat-input-1"]').pressSequentially(caseID, { delay: 100 });
    expect(await (await page.locator(`button:has-text("${caseID}")`).textContent()).trim()).toBe(caseID);

    // await page.locator(`button >> span:has-text(" ${caseID} ")`).click();

    // /** Testing that the Case View has rendered */
    // expect(await page.locator('div[id="current-caseID"]').textContent()).toBe(`DXIL-DIGV2-WORK ${caseID}`);

    // /** Testing that the Assignment has opened */
    // expect(page.locator('mat-select[data-test-id="76729937a5eb6b0fd88c42581161facd"]')).toBeVisible();
  }, 10000);
  test('should login, create case and come back to Home landing page and run tests', async ({ page }) => {
    await common.login(config.config.apps.digv2.user.username, config.config.apps.digv2.user.password, page);

    /** Testing announcement banner presence */
    const announcementBanner = page.locator('h2:has-text("Announcements")');
    await expect(announcementBanner).toBeVisible();

    /** Testing worklist presence */
    const worklist = page.locator('div[id="worklist"]:has-text("My Worklist")');
    await expect(worklist).toBeVisible();

    /** Click on the Create Case button */
    const createCase = page.locator('mat-list-item[id="create-case-button"]');
    await createCase.click();

    /** Creating a View Templates case-type */
    const viewTemplatesCase = page.locator('mat-list-item[id="case-list-item"] > span:has-text("View Templates")');
    await viewTemplatesCase.click();

    /** Click on the `Home` landing page */
    const homeLandingPage = page.locator('mat-list-item > span:has-text("Home")');
    await homeLandingPage.click();

    /** Test whether Home has loaded as expected */
    await expect(announcementBanner).toBeVisible();

    await expect(worklist).toBeVisible();
  }, 10000);
});

test.afterEach(async ({ page }) => {
  await page.close();
});
