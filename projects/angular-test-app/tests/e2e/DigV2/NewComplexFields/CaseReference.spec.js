const { test, expect } = require('@playwright/test');
const config = require('../../../config');
const common = require('../../../common');

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(config.config.baseUrl, { waitUntil: 'networkidle' });
});

const selectComplexFieldType = async (type, page) => {
  await page.locator('mat-select[data-test-id="d1b79d3f-1b8c-4347-bdd8-f86a5967bebf"]').click();
  await page.getByRole('option', { name: type, exact: true }).click();
};

const selectMode = async (mode, page) => {
  const modeDropdown = page.locator('mat-select[data-test-id="5131692e-09b6-45f1-83fa-3c280566f0fa"]');
  await modeDropdown.waitFor({ state: 'visible' });
  await expect(async () => {
    await modeDropdown.click();
    await expect(page.locator('.cdk-overlay-pane mat-option').first()).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 30000 });
  await page.locator(`mat-option > span:has-text("${mode}")`).click();
};

const selectDisplayAs = async (displayAs, page) => {
  const displayDropdown = page.locator('mat-select[data-test-id="a97b483b-34e0-48c5-8f48-a09cee7d74a3"]');
  await displayDropdown.waitFor({ state: 'visible' });
  await displayDropdown.click();
  await page.locator(`mat-option > span:has-text("${displayAs}")`).click();
};

test.describe('Single select mode of Case Reference', () => {
  test('Verify Single select mode of Case Reference displayed as Cards', async ({ page }) => {
    await common.login(config.config.apps.digv2.user.username, config.config.apps.digv2.user.password, page);

    await common.verifyHomePage(page);

    // Creating New complex case type
    await common.createCase('New Complex Fields', page);

    // Get the case ID of the newly created case
    await expect(page.locator('div[id="caseId"]')).not.toBeEmpty();
    const caseID = await page.locator('div[id="caseId"]').textContent();

    // Select Case Reference from the category dropdown
    await selectComplexFieldType('CaseReference', page);
    await page.locator('button:has-text("submit")').click();

    await page.locator('h2:has-text("CaseReference")').waitFor({ state: 'visible' });
    await page.waitForLoadState('networkidle');

    // Select Single Select mode and Cards as display option for the Case Reference field
    await selectMode('Single Select', page);
    await selectDisplayAs('Cards', page);

    // Select current case reference field from the list of cards
    await page.locator(`mat-card:has(label:has-text("${caseID}")) mat-radio-button`).click();
    await page.locator('button:has-text("submit")').click();

    // Verify the selected case reference displays the correct case ID
    await expect(page.locator('app-semantic-link a.psdk-value')).toBeVisible();
    await expect(page.locator('app-semantic-link a.psdk-value')).toHaveText(caseID);
  }, 10000);

  test('Verify Single select mode of Case Reference displayed as Combobox', async ({ page }) => {
    await common.login(config.config.apps.digv2.user.username, config.config.apps.digv2.user.password, page);

    await common.verifyHomePage(page);

    // Creating New complex case type
    await common.createCase('New Complex Fields', page);

    // Get the case ID of the newly created case
    await expect(page.locator('div[id="caseId"]')).not.toBeEmpty();
    const caseID = await page.locator('div[id="caseId"]').textContent();

    // Select Case Reference from the category dropdown
    await selectComplexFieldType('CaseReference', page);
    await page.locator('button:has-text("submit")').click();

    await page.locator('h2:has-text("CaseReference")').waitFor({ state: 'visible' });
    await page.waitForLoadState('networkidle');

    // Select Single Select mode and Cards as display option for the Case Reference field
    await selectMode('Single Select', page);
    await selectDisplayAs('Combobox', page);

    // Select current case reference field from the list of combobox options
    const combobox = page.locator('input[role="combobox"]');
    await combobox.click();
    await combobox.fill(caseID);
    await page.locator(`mat-option:has-text("${caseID}")`).click();
    await page.locator('button:has-text("submit")').click();

    // Verify the selected case reference displays the correct case ID
    await expect(page.locator('app-semantic-link a.psdk-value')).toBeVisible();
    await expect(page.locator('app-semantic-link a.psdk-value')).toHaveText(caseID);
  }, 10000);

  test('Verify Single select mode of Case Reference displayed as Dropdown', async ({ page }) => {
    await common.login(config.config.apps.digv2.user.username, config.config.apps.digv2.user.password, page);

    await common.verifyHomePage(page);

    // Creating New complex case type
    await common.createCase('New Complex Fields', page);

    // Get the case ID of the newly created case
    await expect(page.locator('div[id="caseId"]')).not.toBeEmpty();
    const caseID = await page.locator('div[id="caseId"]').textContent();

    // Select Case Reference from the category dropdown
    await selectComplexFieldType('CaseReference', page);
    await page.locator('button:has-text("submit")').click();

    await page.locator('h2:has-text("CaseReference")').waitFor({ state: 'visible' });
    await page.waitForLoadState('networkidle');

    // Select Single Select mode and Cards as display option for the Case Reference field
    await selectMode('Single Select', page);
    await selectDisplayAs('Dropdown', page);

    // Select current case reference field from the list of dropdown options
    const dropdown = page.locator('mat-select[role="combobox"]').last();
    await dropdown.click();
    await page.locator(`mat-option:has-text("${caseID}")`).click();
    await page.locator('button:has-text("submit")').click();

    // Verify the selected case reference displays the correct case ID
    await expect(page.locator('app-semantic-link a.psdk-value')).toBeVisible();
    await expect(page.locator('app-semantic-link a.psdk-value')).toHaveText(caseID);
  }, 10000);

  test('Verify Single select mode of Case Reference displayed as Search and select', async ({ page }) => {
    await common.login(config.config.apps.digv2.user.username, config.config.apps.digv2.user.password, page);

    await common.verifyHomePage(page);

    // Creating New complex case type
    await common.createCase('New Complex Fields', page);

    // Get the case ID of the newly created case
    await expect(page.locator('div[id="caseId"]')).not.toBeEmpty();
    const caseID = await page.locator('div[id="caseId"]').textContent();

    // Select Case Reference from the category dropdown
    await selectComplexFieldType('CaseReference', page);
    await page.locator('button:has-text("submit")').click();

    await page.locator('h2:has-text("CaseReference")').waitFor({ state: 'visible' });
    await page.waitForLoadState('networkidle');

    // Select Single Select mode and Search and select as display option for the Case Reference field
    await selectMode('Single Select', page);
    await selectDisplayAs('Search and select', page);

    // Select current case reference field from the Search and select options
    const targetCaseID = caseID.trim();
    const searchInput = page.getByLabel('Case ID');
    await searchInput.click();
    await searchInput.fill(targetCaseID);
    await page.locator('button:has(span:has-text("Search"))').click();

    // Wait for search results to load and select the correct case reference
    const searchResultRow = page.locator('tr[role="row"]', { hasText: targetCaseID });
    await searchResultRow.waitFor({ state: 'visible' });
    await searchResultRow.locator('mat-radio-button').click();

    await page.locator('button:has-text("submit")').click();

    // Verify the selected case reference displays the correct case ID
    await expect(page.locator('app-semantic-link a.psdk-value')).toBeVisible();
    await expect(page.locator('app-semantic-link a.psdk-value')).toHaveText(caseID);
  }, 10000);
});

test.afterEach(async ({ page }) => {
  await page.close();
});
