import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerConfigService } from '../../../_services/server-config.service';
import { createMockChild, createMockPConn } from '../../../../test-setup';
import { stubComponentMapper } from '../../../../test-utils';
import { RootContainerComponent } from './root-container.component';

describe('RootContainerComponent', () => {
  let component: RootContainerComponent;
  let fixture: ComponentFixture<RootContainerComponent>;
  let createPConnect: ReturnType<typeof vi.fn>;
  let storeListener: () => void;
  const createdPConn = Object.assign(createMockPConn(), { marker: 'created' });
  const created = { getPConnect: () => createdPConn };

  const render = (config: Record<string, unknown>, children: any[] = []) => {
    const pConn = createMockPConn();
    pConn.getConfigProps = () => config;
    pConn.resolveConfigProps = (p: any) => p;
    pConn.getChildren = () => children;
    (component as any).pConn$ = pConn;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    createPConnect = vi.fn().mockReturnValue(created);
    (globalThis as any).PCore.createPConnect = createPConnect;
    (globalThis as any).PCore.getStore = () => ({
      getState: () => ({ containers: {} }),
      subscribe: (cb: () => void) => ((storeListener = cb), () => undefined)
    });

    TestBed.configureTestingModule({ imports: [RootContainerComponent] });
    vi.spyOn(TestBed.inject(ServerConfigService), 'getSdkConfig').mockResolvedValue({ serverConfig: { showModalsInEmbeddedMode: false } });
    await stubComponentMapper();
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(RootContainerComponent);
    component = fixture.componentInstance;
  });

  it('creates the preview and modal view containers on start', async () => {
    render({});
    await vi.waitFor(() => expect(component.mConn$).toBeDefined());

    const types = createPConnect.mock.calls.map(([arg]) => arg.meta.type);
    expect(types).toEqual(expect.arrayContaining(['PreviewViewContainer', 'ModalViewContainer']));
  });

  it('skips the modal container for display-only embedded mode unless the config allows modals', async () => {
    (component as any).displayOnlyFA$ = true;
    render({});
    await vi.waitFor(() => expect(createPConnect).toHaveBeenCalled());
    await fixture.whenStable();

    expect(component.mConn$).toBeNull();
  });

  it('resets the view container flag in session storage', () => {
    sessionStorage.setItem('hasViewContainer', 'true');
    render({});
    expect(sessionStorage.getItem('hasViewContainer')).toBe('false');
  });

  it('shows the root view container in noPortal (mashup) mode when it has a single ViewContainer child', async () => {
    const child = createMockChild({ getComponentName: () => 'ViewContainer' });
    render({ renderingMode: 'noPortal' }, [child]);
    storeListener(); // the engine reports the rendering mode through a store update

    await vi.waitFor(() => expect(component.componentName$).toBe('ViewContainer'));
    expect(component.viewContainerPConn$).toBe(createdPConn);
  });

  it('does not show the "Missing" message while the root component name is still unknown', () => {
    render({});
    expect(component.componentName$).toBeUndefined();
    expect(fixture.nativeElement.textContent).not.toContain('Missing');
  });

  it('shows the "Missing" message once an unsupported root component name is known', () => {
    component.componentName$ = 'Unsupported';
    render({});
    expect(fixture.nativeElement.textContent).toContain('RootContainer Missing: Unsupported.');
  });
});
