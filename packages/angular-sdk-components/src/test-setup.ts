// Minimal PCore stand-in so components can be instantiated in unit tests without the Constellation engine.
const noop = () => undefined;

const explicitPCore = () => ({
  getEnvironmentInfo: () => ({ getTimeZone: () => 'UTC', getLocale: () => 'en-US' }),
  getLocaleUtils: () => ({ getLocaleValue: (v: string) => v }),
  getStore: () => ({ getState: () => ({}), subscribe: () => noop }),
  getContextTreeManager: () => ({ removeFieldNode: noop, addFieldNode: noop, removeViewNode: noop, addViewNode: noop }),
  getConstants: () => ({ MESSAGES: { MESSAGES: 'messages' }, PUBLIC_CONSTANTS: {} }),
  getStoreValue: noop,
  setBehaviorOverride: noop,
  getEvents: () => ({ getCaseEvent: () => ({}), getTransientEvent: () => ({}) }),
  getPubSubUtils: () => ({ subscribe: noop, unsubscribe: noop, publish: noop }),
  getMessagingServiceManager: () => ({ unsubscribe: noop, subscribe: noop })
});

/**
 * Unknown PCore.getXxx() calls return a shallow object: ALL_CAPS members resolve to their own name (constants),
 * other members to no-op functions. Kept shallow on purpose so engine-walking loops cannot spin forever.
 */
const shallow = (base: any): any =>
  new Proxy(base ?? {}, {
    get: (t, prop) => {
      if (typeof prop === 'symbol' || prop === 'then') return undefined;
      if (prop in t) return t[prop];
      return /^[A-Z][A-Z0-9_]*$/.test(prop) ? prop : () => undefined;
    }
  });

const lenientRoot = (base: any): any =>
  new Proxy(base, {
    get: (t, prop) => {
      if (typeof prop === 'symbol' || prop === 'then') return undefined;
      const v = t[prop];
      if (typeof v === 'function') return (...args: unknown[]) => shallowResult(v(...args));
      return v ?? ((): any => shallow({}));
    }
  });

const shallowResult = (v: any) => (v !== null && typeof v === 'object' ? shallow(v) : v);

export const createPCoreStub = () => lenientRoot(explicitPCore());

const pConnDefaults: Record<string, () => unknown> = {
  getConfigProps: () => ({}),
  getRawConfigProps: () => ({}),
  resolveConfigProps: () => ({}),
  getStateProps: () => ({}),
  getActionsApi: () => ({}),
  getChildren: () => [],
  getPageReference: () => '',
  getContextName: () => 'app/primary_1',
  getCaseInfo: () => ({ getKey: () => '', getClassName: () => '' }),
  getComponentName: () => '',
  getLocalizedValue: () => ''
};

/** Lenient PConnect double: known getters return empty values, any other method is a no-op. */
export function createMockPConn(): any {
  const target: any = { meta: { config: {} } };
  const proxy: any = new Proxy(target, {
    get: (_t, prop: string | symbol) => {
      if (typeof prop === 'symbol' || prop === 'then') return undefined;
      if (prop in target) return target[prop];
      if (prop === 'getPConnect') return () => proxy;
      return pConnDefaults[prop] ?? (() => undefined);
    }
  });
  return proxy;
}

(globalThis as any).PCore = createPCoreStub();

/** Runs axe-core (WCAG 2.x A/AA rules) against a rendered element and returns a readable list of violations. */
export async function getA11yViolations(element: HTMLElement): Promise<string[]> {
  const axe = (await import('axe-core')).default;
  document.body.appendChild(element);
  try {
    const results = await axe.run(element, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
    return results.violations.map(v => `${v.id}: ${v.help} (${v.nodes.map(n => n.target.join(' ')).join(', ')})`);
  } finally {
    element.remove();
  }
}
