import { afterEach, beforeAll, beforeEach, vi } from 'vitest';
// Global test hooks, loaded through `setupFiles` before every spec file. Entering the module graph through the component map
// first is required: component -> mapper -> component map -> component is an import cycle that only initialises when
// started from the map (as the real app does).
import { getSdkComponentMap } from './lib/_bridge/helpers/sdk_component_map';
import { ServerConfigService } from './lib/_services/server-config.service';
import { createPCoreStub } from './test-setup';

beforeAll(async () => {
  await getSdkComponentMap();
});

// Specs may overwrite PCore with partial mocks; restore a fresh default before each spec.
beforeEach(() => {
  (globalThis as any).PCore = createPCoreStub();
  vi.spyOn(ServerConfigService.prototype, 'getSdkConfigServer').mockReturnValue({ infinityRestServerUrl: '', sdkContentServerUrl: '' });
});

afterEach(() => {
  vi.restoreAllMocks();
});
