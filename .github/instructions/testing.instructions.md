---
applyTo: "projects/angular-test-app/tests/**,**/*.spec.*,**/*.test.*"
description: "Use when writing or modifying tests. Covers Karma/Jasmine unit tests, Playwright E2E setup, test credentials, helpers, and configuration."
---
# Testing

This project uses Karma/Jasmine for unit tests and Playwright for end-to-end tests.

## Structure

```
projects/angular-test-app/tests/
├── common.js           # Shared Playwright helpers (launchPortal, login, date utils, Material selectors)
├── config.js           # Test environment config (URLs, credentials, viewport settings)
└── e2e/                # Playwright E2E tests
    ├── MediaCo/        # MediaCo sample app tests
    │   ├── portal.spec.js     # Full portal workflow
    │   └── embedded.spec.js   # Embedded/mashup workflow
    └── DigV2/          # DigV2 application tests
        ├── ComplexFields/     # Complex field scenarios
        ├── FormFields/        # Form field tests
        ├── LandingPages/      # Landing page tests
        ├── Localization/      # Locale tests
        ├── NewComplexFields/  # Additional complex fields
        ├── Process/           # Case process flow tests
        ├── SelfService/       # Self-service portal tests
        └── ViewTemplates/     # View template tests

packages/angular-sdk-components/src/lib/
├── angular-sdk-components.component.spec.ts   # Root component unit test
├── angular-sdk-components.service.spec.ts     # Root service unit test
└── _bridge/
    └── angular-pconnect.service.spec.ts       # Bridge service unit test
```

## Unit Tests (Karma/Jasmine)

### Running
```bash
ng test angular-sdk-components    # Run library unit tests
```

### Configuration
- Karma config: `packages/angular-sdk-components/tsconfig.spec.json`
- Framework: Jasmine with Karma runner
- Browser: Chrome (karma-chrome-launcher)
- Coverage: karma-coverage reporter

### Writing Unit Tests
- Place spec files alongside the component: `component-name.component.spec.ts`
- Use `TestBed.configureTestingModule()` for component setup
- Use `ComponentFixture` for component interaction
- Mock `PCore` and `pConn$` — components always expect these runtime globals

### Example
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextInputComponent } from './text-input.component';

describe('TextInputComponent', () => {
  let component: TextInputComponent;
  let fixture: ComponentFixture<TextInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TextInputComponent]  // standalone component
    });
    fixture = TestBed.createComponent(TextInputComponent);
    component = fixture.componentInstance;
    // Must mock pConn$ before detectChanges
    component.pConn$ = mockPConnect;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## E2E Tests (Playwright)

### Prerequisites
1. App must be running: `npm run start-dev` (serves at http://localhost:3500)
2. Pega Infinity server must be accessible at the URL in `sdk-config.json`
3. Test users must exist on the Infinity server

### Running
```bash
npm test                     # Chromium, MediaCo portal + embedded (headless)
npm run test:headed          # Same but with visible browser
npx playwright test --debug  # Debug mode (step through)
npm run test-report          # View last test report
```

### Test Credentials (config.js)

| App | Role | Username | Password |
|-----|------|----------|----------|
| MediaCo | Representative | `rep@mediaco` | `pega` |
| MediaCo | Manager | `manager@mediaco` | `pega` |
| MediaCo | Technician | `tech@mediaco` | `pega` |
| MediaCo | Admin | `admin@mediaco` | `pega` |
| DigV2 | User | `user.digv2` | `pega` |
| DigV2 | Localized User | `localization@DigV2` | `pega` |

### Configuration (config.js)
- `baseUrl`: `http://localhost:3500/portal`
- `baseEmbedUrl`: `http://localhost:3500/embedded`
- Viewport: 1920x1080 (config.js), overridden to 1720x1080 in common.js helpers
- Default timeout: 60s
- Headless by default
- SlowMo: 120ms (config.js), 200ms (playwright.config.js `launchOptions`)

### Shared Helpers (common.js)

| Function | Purpose |
|----------|---------|
| `launchPortal({ page })` | Navigate to portal URL, set viewport to 1720x1080 |
| `launchEmbedded({ page })` | Navigate to embedded URL, set viewport to 1720x1080 |
| `launchSelfServicePortal({ page })` | Navigate to self-service portal with `?portal=DigV2SelfService` |
| `login(username, password, page)` | Fill login form (`#txtUserID`, `#txtPassword`) and submit |
| `createCase(caseTypeName, page)` | Click create button and select case type from list |
| `getFormattedDate(date)` | Format date as `MM/DD/YYYY` |
| `getFutureDate()` | Get date 2 days from now (formatted) |
| `selectDateFromPicker(page, day, month, year)` | Navigate Angular Material datepicker: open → select year → month → day |
| `selectCategory(category, page)` | Select from category `mat-select` dropdown |
| `selectSubCategory(subCategory, page)` | Select from sub-category `mat-select` dropdown |
| `verifyHomePage(page)` | Assert announcements banner and worklist are visible |
| `fillTextInput(page, testID, text)` | Fill an input by `data-test-id` attribute |

### Playwright Config (playwright.config.js)
- Test directory: `projects/angular-test-app/tests`
- Test timeout: 240 seconds (120s × 2)
- Assertion timeout: 50 seconds
- Action timeout: 50 seconds
- Trace: on first retry
- Retries: 2 on CI, 0 locally
- Ignored tests: `ManyToMany.spec.js`, `Localization.spec.js`
- Report: HTML output to `tests/playwright-report/`

### Writing E2E Tests

Tests follow the **login → navigate → interact → assert** pattern:

```javascript
const { test, expect } = require('@playwright/test');
const config = require('../../config');
const common = require('../../common');

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(config.config.baseUrl, { waitUntil: 'networkidle' });
});

test('should create a case', async ({ page }) => {
  await common.login(config.config.apps.mediaCo.rep.username,
                     config.config.apps.mediaCo.rep.password, page);
  await common.verifyHomePage(page);
  await common.createCase('New Service', page);
  // Interact with form fields...
});
```

### Angular Material-Specific Selectors

When writing E2E tests for this Angular SDK, use Material-specific selectors:

| Element | Selector Pattern |
|---------|-----------------|
| Text input | `input[data-test-id="..."]` |
| Mat-select dropdown | `mat-select[data-test-id="..."]` → click → `mat-option:has-text("...")` |
| Mat-radio button | `mat-radio-button:has-text("...") input[type="radio"]` |
| Mat-card selection | `mat-card:has-text("...")` |
| Mat-datepicker | `button[aria-label="Open calendar"]` → navigate year/month → `[aria-label="..."]` |
| Submit button | `button:has-text("submit")` |
| Mat-autocomplete | `input[data-test-id="..."]` → type → `mat-option:has-text("...")` |

### Key Differences from React E2E Tests

| Concern | React | Angular |
|---------|-------|---------|
| Dev server port | 3502 | 3500 |
| Dropdown selectors | MUI `role="option"` | `mat-option:has-text("...")` |
| Radio buttons | MUI `role="radio"` | `mat-radio-button:has-text("...") input[type="radio"]` |
| Select/Combobox | MUI `role="combobox"` | `mat-select[data-test-id="..."]` |
| Date picker | MUI DatePicker API | `selectDateFromPicker()` helper with Material calendar navigation |
| Card selection | MUI Card click | `mat-card:has-text("...")` |
| Create case | Button click | `mat-list-item[id="create-case-button"]` → `mat-list-item[id="case-list-item"]` |
