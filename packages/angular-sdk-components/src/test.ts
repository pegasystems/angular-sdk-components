// Central test entry for angular-sdk-components library
// Mirrors default Angular CLI test.ts responsibilities plus our PCore stub setup.

import 'zone.js';
import 'zone.js/testing';

// Initialize Angular testing environment
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

// Load global constellation stubs
import './test-setup';

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
