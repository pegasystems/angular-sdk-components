// The leading underscore makes this file load first. It enters the module graph through the component map, which is the
// only entry order that avoids "Cannot access 'X' before initialization": component -> mapper -> map -> component is a
// cycle that only evaluates correctly when started from the map (as the real app does).
import { getSdkComponentMap } from './lib/_bridge/helpers/sdk_component_map';
import { ServerConfigService } from './lib/_services/server-config.service';
import { createPCoreStub } from './test-setup';

beforeAll(async () => {
  await getSdkComponentMap();
});

// Specs may overwrite PCore with partial mocks; restore a fresh default before each spec.
beforeEach(() => {
  (globalThis as any).PCore = createPCoreStub();
  spyOn(ServerConfigService.prototype, 'getSdkConfigServer').and.returnValue({ infinityRestServerUrl: '', sdkContentServerUrl: '' });
});
