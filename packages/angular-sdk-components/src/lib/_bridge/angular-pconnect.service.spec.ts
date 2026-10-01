import type { Mock } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { AngularPConnectService } from './angular-pconnect';

type StoreListener = () => void;

/** Builds a component double that satisfies the bridge's registration contract. */
function createComp(configProps: Record<string, any> = { label: 'A' }) {
  const state = { props: configProps };
  const pConn: any = {
    meta: { config: {} },
    isEditable: () => true,
    setAction: vi.fn(),
    getActions: () => ({}),
    addFormField: vi.fn(),
    removeFormField: vi.fn(),
    getContextName: () => 'app/primary_1',
    getPageReference: () => 'caseInfo.content',
    getConfigProps: () => state.props,
    populateAdditionalProps: () => undefined,
    resolveConfigProps: (p: any) => ({ ...p }),
    getStateProps: () => ({}),
    _rawConfig: {},
    _type: 'Text',
    _getPropertyName: () => 'Name'
  };
  return { comp: { pConn$: pConn, angularPConnectData: {} } as any, pConn, state };
}

describe('AngularPConnectService', () => {
  let service: AngularPConnectService;
  let listeners: StoreListener[];
  let storeUnsubscribe: Mock;

  beforeEach(() => {
    listeners = [];
    storeUnsubscribe = vi.fn();
    (globalThis as any).PCore = {
      setBehaviorOverride: () => undefined,
      getEnvironmentInfo: () => ({ getTimeZone: () => 'UTC' }),
      getStore: () => ({
        getState: () => ({}),
        subscribe: (cb: StoreListener) => {
          listeners.push(cb);
          return storeUnsubscribe;
        }
      }),
      getContextTreeManager: () => ({ removeFieldNode: () => undefined, removeViewNode: () => undefined })
    };
    TestBed.configureTestingModule({});
    service = TestBed.inject(AngularPConnectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('registerAndSubscribeComponent', () => {
    it('returns an empty registration when the callback is missing', () => {
      const { comp } = createComp();
      const data = service.registerAndSubscribeComponent(comp, null);
      expect(data.compID).toBe('');
      expect(listeners.length).toBe(0);
    });

    it('assigns unique component ids and subscribes to the store', () => {
      const a = createComp();
      const b = createComp();
      a.comp.angularPConnectData = service.registerAndSubscribeComponent(a.comp, () => undefined);
      b.comp.angularPConnectData = service.registerAndSubscribeComponent(b.comp, () => undefined);

      expect(a.comp.angularPConnectData.compID).toBeTruthy();
      expect(a.comp.angularPConnectData.compID).not.toBe(b.comp.angularPConnectData.compID);
      expect(service.getComponentID(a.comp)).toBe(a.comp.angularPConnectData.compID);
      expect(listeners.length).toBe(2);
    });

    it('registers form field and onChange/onBlur actions for editable components', () => {
      const { comp, pConn } = createComp();
      service.registerAndSubscribeComponent(comp, () => undefined);
      expect(pConn.addFormField).toHaveBeenCalled();
      expect(pConn.setAction).toHaveBeenCalledWith('onChange', expect.any(Function));
      expect(pConn.setAction).toHaveBeenCalledWith('onBlur', expect.any(Function));
    });

    it('invokes the callback bound to the component on store changes until unsubscribed', () => {
      const { comp, pConn } = createComp();
      const callback = vi.fn();
      comp.angularPConnectData = service.registerAndSubscribeComponent(comp, callback);

      listeners[0]();
      expect(callback).toHaveBeenCalledTimes(1);

      comp.angularPConnectData.unsubscribeFn();
      expect(storeUnsubscribe).toHaveBeenCalled();
      expect(pConn.removeFormField).toHaveBeenCalled();

      listeners[0]();
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('shouldComponentUpdate', () => {
    it('returns false for an empty component', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      expect(service.shouldComponentUpdate({})).toBe(false);
    });

    it('reports a change on first evaluation and no change when props are identical', () => {
      const { comp } = createComp({ label: 'A' });
      comp.angularPConnectData = service.registerAndSubscribeComponent(comp, () => undefined);

      expect(service.shouldComponentUpdate(comp)).toBe(true);
      expect(service.shouldComponentUpdate(comp)).toBe(false);
    });

    it('reports a change when a config prop changes', () => {
      const { comp, state } = createComp({ label: 'A' });
      comp.angularPConnectData = service.registerAndSubscribeComponent(comp, () => undefined);
      service.shouldComponentUpdate(comp);

      state.props = { label: 'B' };
      expect(service.shouldComponentUpdate(comp)).toBe(true);
      expect(service.getComponentProp(comp, 'label')).toBe('B');
    });

    it('ignores blank page messages when deciding whether to update', () => {
      const { comp, state } = createComp({ label: 'A', pageMessages: [] });
      comp.angularPConnectData = service.registerAndSubscribeComponent(comp, () => undefined);
      service.shouldComponentUpdate(comp);

      state.props = { label: 'A', pageMessages: [] };
      expect(service.shouldComponentUpdate(comp)).toBe(false);
    });

    it('stores the decoded validation message on the component bridge data', () => {
      const { comp, state } = createComp({ label: 'A' });
      comp.angularPConnectData = service.registerAndSubscribeComponent(comp, () => undefined);
      service.shouldComponentUpdate(comp);

      state.props = { label: 'A', validatemessage: 'Required' };
      expect(service.shouldComponentUpdate(comp)).toBe(true);
      expect(comp.angularPConnectData.validateMessage).toBe('Required');
    });

    it('always re-renders contextual components nested below the case content', () => {
      const { comp, pConn } = createComp({ label: 'A' });
      comp.angularPConnectData = service.registerAndSubscribeComponent(comp, () => undefined);
      service.shouldComponentUpdate(comp);

      pConn.meta.config.context = '.Pages';
      pConn.getPageReference = () => 'caseInfo.content.Pages';
      expect(service.shouldComponentUpdate(comp)).toBe(true);
    });
  });

  describe('store callbacks during change detection', () => {
    const setTickRunning = (running: boolean) => ((service as any).appRef._runningTick = running);

    it('applies a store callback synchronously when no change detection is running', () => {
      const { comp } = createComp();
      const callback = vi.fn();
      comp.angularPConnectData = service.registerAndSubscribeComponent(comp, callback);

      listeners[0]();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('defers a store callback that arrives during change detection and then schedules a new pass', async () => {
      const { comp } = createComp();
      const callback = vi.fn();
      comp.angularPConnectData = service.registerAndSubscribeComponent(comp, callback);
      const tick = vi.spyOn((service as any).appRef, 'tick').mockImplementation(() => undefined);

      setTickRunning(true);
      listeners[0]();
      expect(callback).not.toHaveBeenCalled();

      setTickRunning(false);
      await Promise.resolve();

      expect(callback).toHaveBeenCalledTimes(1);
      expect(tick).toHaveBeenCalledTimes(1);
    });

    it('lets components with markForCheck schedule the next pass themselves', async () => {
      const { comp } = createComp();
      comp.markForCheck = vi.fn();
      comp.angularPConnectData = service.registerAndSubscribeComponent(comp, vi.fn());
      const tick = vi.spyOn((service as any).appRef, 'tick').mockImplementation(() => undefined);

      setTickRunning(true);
      listeners[0]();
      setTickRunning(false);
      await Promise.resolve();

      expect(comp.markForCheck).toHaveBeenCalledTimes(1);
      expect(tick).not.toHaveBeenCalled();
    });

    it('drops a deferred callback when the component unsubscribed in the meantime', async () => {
      const { comp } = createComp();
      const callback = vi.fn();
      comp.angularPConnectData = service.registerAndSubscribeComponent(comp, callback);

      setTickRunning(true);
      listeners[0]();
      setTickRunning(false);
      comp.angularPConnectData.unsubscribeFn();
      await Promise.resolve();

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
