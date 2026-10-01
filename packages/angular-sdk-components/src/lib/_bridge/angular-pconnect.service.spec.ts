import { TestBed } from '@angular/core/testing';

import { AngularPConnectService } from './angular-pconnect';

type StoreListener = () => void;

/** Builds a component double that satisfies the bridge's registration contract. */
function createComp(configProps: Record<string, any> = { label: 'A' }) {
  const state = { props: configProps };
  const pConn: any = {
    meta: { config: {} },
    isEditable: () => true,
    setAction: jasmine.createSpy('setAction'),
    getActions: () => ({}),
    addFormField: jasmine.createSpy('addFormField'),
    removeFormField: jasmine.createSpy('removeFormField'),
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
  let storeUnsubscribe: jasmine.Spy;

  beforeEach(() => {
    listeners = [];
    storeUnsubscribe = jasmine.createSpy('storeUnsubscribe');
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
      expect(pConn.setAction).toHaveBeenCalledWith('onChange', jasmine.any(Function));
      expect(pConn.setAction).toHaveBeenCalledWith('onBlur', jasmine.any(Function));
    });

    it('invokes the callback bound to the component on store changes until unsubscribed', () => {
      const { comp, pConn } = createComp();
      const callback = jasmine.createSpy('callback');
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
      spyOn(console, 'error');
      expect(service.shouldComponentUpdate({})).toBeFalse();
    });

    it('reports a change on first evaluation and no change when props are identical', () => {
      const { comp } = createComp({ label: 'A' });
      comp.angularPConnectData = service.registerAndSubscribeComponent(comp, () => undefined);

      expect(service.shouldComponentUpdate(comp)).toBeTrue();
      expect(service.shouldComponentUpdate(comp)).toBeFalse();
    });

    it('reports a change when a config prop changes', () => {
      const { comp, state } = createComp({ label: 'A' });
      comp.angularPConnectData = service.registerAndSubscribeComponent(comp, () => undefined);
      service.shouldComponentUpdate(comp);

      state.props = { label: 'B' };
      expect(service.shouldComponentUpdate(comp)).toBeTrue();
      expect(service.getComponentProp(comp, 'label')).toBe('B');
    });

    it('ignores blank page messages when deciding whether to update', () => {
      const { comp, state } = createComp({ label: 'A', pageMessages: [] });
      comp.angularPConnectData = service.registerAndSubscribeComponent(comp, () => undefined);
      service.shouldComponentUpdate(comp);

      state.props = { label: 'A', pageMessages: [] };
      expect(service.shouldComponentUpdate(comp)).toBeFalse();
    });

    it('stores the decoded validation message on the component bridge data', () => {
      const { comp, state } = createComp({ label: 'A' });
      comp.angularPConnectData = service.registerAndSubscribeComponent(comp, () => undefined);
      service.shouldComponentUpdate(comp);

      state.props = { label: 'A', validatemessage: 'Required' };
      expect(service.shouldComponentUpdate(comp)).toBeTrue();
      expect(comp.angularPConnectData.validateMessage).toBe('Required');
    });

    it('always re-renders contextual components nested below the case content', () => {
      const { comp, pConn } = createComp({ label: 'A' });
      comp.angularPConnectData = service.registerAndSubscribeComponent(comp, () => undefined);
      service.shouldComponentUpdate(comp);

      pConn.meta.config.context = '.Pages';
      pConn.getPageReference = () => 'caseInfo.content.Pages';
      expect(service.shouldComponentUpdate(comp)).toBeTrue();
    });
  });
});
