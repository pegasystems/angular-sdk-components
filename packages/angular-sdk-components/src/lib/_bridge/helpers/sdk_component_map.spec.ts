// Component and map modules are imported lazily: they form an import cycle that only initializes
// correctly when entered through the shared test hooks (see src/test-hooks.spec.ts).
const loadMap = () => import('./sdk_component_map');

describe('getComponentFromMap', () => {
  let originalLocalMap: any;

  beforeEach(async () => {
    const { SdkComponentMap } = await loadMap();
    originalLocalMap = SdkComponentMap.getLocalComponentMap();
    spyOn(console, 'log');
  });

  afterEach(async () => {
    const { SdkComponentMap } = await loadMap();
    SdkComponentMap.setLocalComponentMap(originalLocalMap);
  });

  it('resolves SDK-provided components by name', async () => {
    const { getComponentFromMap } = await loadMap();
    const { TextComponent } = await import('../../_components/field/text/text.component');
    expect(getComponentFromMap('Text')).toBe(TextComponent);
  });

  it('prefers a local override over the SDK-provided component', async () => {
    const { getComponentFromMap, SdkComponentMap } = await loadMap();
    class LocalText {}
    SdkComponentMap.setLocalComponentMap({ Text: LocalText });
    expect(getComponentFromMap('Text')).toBe(LocalText);
  });

  it('falls back to the error boundary and logs for unmapped components', async () => {
    const { getComponentFromMap } = await loadMap();
    const { ErrorBoundaryComponent } = await import('../../_components/infra/error-boundary/error-boundary.component');
    const errorSpy = spyOn(console, 'error');
    expect(getComponentFromMap('DoesNotExist')).toBe(ErrorBoundaryComponent);
    expect(errorSpy).toHaveBeenCalledWith(jasmine.stringContaining('DoesNotExist'));
  });
});
