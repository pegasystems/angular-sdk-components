// Named with a leading underscore so it loads first: entering the module graph through the component map avoids
// circular-import initialization errors that occur when a single component spec is loaded in isolation.
import { ServerConfigService } from './lib/_services/server-config.service';
import { createPCoreStub } from './test-setup';

beforeAll(async () => {
  const { getSdkComponentMap } = await import('./lib/_bridge/helpers/sdk_component_map');
  await getSdkComponentMap();
});

// Specs may overwrite PCore with partial mocks; restore a fresh default before each spec.
beforeEach(() => {
  (globalThis as any).PCore = createPCoreStub();
  spyOn(ServerConfigService.prototype, 'getSdkConfigServer').and.returnValue({ infinityRestServerUrl: '', sdkContentServerUrl: '' });
});
