import pegaSdkComponentMap from './sdk-pega-component-map';
import { getComponentFromMap, SdkComponentMap } from './sdk_component_map';

describe('getComponentFromMap', () => {
  let originalLocalMap: any;

  beforeEach(() => {
    originalLocalMap = SdkComponentMap.getLocalComponentMap();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    SdkComponentMap.setLocalComponentMap(originalLocalMap);
  });

  it('resolves SDK-provided components by name', () => {
    expect(pegaSdkComponentMap.Text).toBeDefined();
    expect(getComponentFromMap('Text')).toBe(pegaSdkComponentMap.Text);
  });

  it('prefers a local override over the SDK-provided component', () => {
    class LocalText {}
    SdkComponentMap.setLocalComponentMap({ Text: LocalText });
    expect(getComponentFromMap('Text')).toBe(LocalText);
  });

  it('falls back to the error boundary and logs for unmapped components', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(getComponentFromMap('DoesNotExist')).toBe(pegaSdkComponentMap.ErrorBoundary);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('DoesNotExist'));
  });
});
