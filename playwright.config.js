// eslint-disable-next-line strict
const { devices } = require('@playwright/test');

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * @see https://playwright.dev/docs/test-configuration
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
const config = {
  testDir: 'projects/angular-test-app/tests',
  /* Maximum time one test can run for. */
  timeout: 120 * 1000 * 2,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 50000
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.PW_WORKERS ? Number(process.env.PW_WORKERS) : process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  // CI gets machine-readable output (JUnit for Azure DevOps/Jenkins/GitLab, annotations on GitHub) next to the HTML report.
  reporter: process.env.CI
    ? [
        ['list'],
        ['html', { outputFolder: 'tests/playwright-report', open: 'never' }],
        ['junit', { outputFile: process.env.PW_JUNIT_OUTPUT || 'test-results/junit.xml' }],
        ...(process.env.GITHUB_ACTIONS ? [['github']] : [])
      ]
    : [['html', { outputFolder: 'tests/playwright-report' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 50000,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.SDK_E2E_BASE_URL || 'http://localhost:3500',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'retain-on-failure' : 'off',
    ignoreHTTPSErrors: true,
    launchOptions: {
      // Override with PW_SLOW_MO=0 for faster CI runs
      slowMo: Number(process.env.PW_SLOW_MO ?? 200)
    }
  },
  testIgnore: ['e2e/DigV2/ComplexFields/ManyToMany.spec.js', 'e2e/DigV2/Localization/Localization.spec.js'],
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox']
      }
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari']
      }
    }

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     channel: 'chrome',
    //   },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  // Set PW_START_SERVER=1 to have Playwright build-serve the app itself (needs sdk-config.json to be configured).
  webServer: process.env.PW_START_SERVER
    ? {
        command: process.env.PW_SERVER_COMMAND || 'npm run start-prod',
        url: process.env.SDK_E2E_BASE_URL || 'http://localhost:3500',
        reuseExistingServer: !process.env.CI,
        timeout: 10 * 60 * 1000,
        ignoreHTTPSErrors: true
      }
    : undefined
};

module.exports = config;
