import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed, effect, inject, Injector, DestroyRef } from '@angular/core';
import { shallowEqual } from 'shallow-equal';

/**
 * Compare function for classID changes
 */
const isClassIDCompare = (key: string, prev: any, next: any) => {
  return !(key === 'classID' && (!prev[key] || !next[key]));
};

/**
 * Compare function for routing changes
 */
const routingInfoCompare = (next: any, prev: any) => {
  return 'routingInfo' in next && (!shallowEqual(next.routingInfo, prev.routingInfo) || !PCore.isDeepEqual(next.routingInfo, prev.routingInfo));
};

/**
 * Main logical function to determine if props have meaningfully changed
 */
const areStatePropsEqual = (prev: any, next: any, pConn: any): boolean => {
  if (!pConn) return true;

  const allStateProps = pConn.getStateProps(); // Get the keys we care about

  for (const key of Object.keys(allStateProps)) {
    if (Object.prototype.hasOwnProperty.call(allStateProps, key)) {
      if (key === 'inheritedProps' && next.inheritedProps && !PCore.isDeepEqual(next.inheritedProps, prev.inheritedProps)) {
        return false;
      }
      if (
        key !== 'inheritedProps' &&
        ((isClassIDCompare(key, prev, next) && !shallowEqual(next[key], prev[key])) ||
          (next.routingInfo && !PCore.isDeepEqual(next.routingInfo, prev.routingInfo)))
      ) {
        return false;
      }
    }
  }

  // For CaseSummary, we need to compare changes in
  //  primaryFields and secondary Fields
  if (next.template === 'CaseSummary') {
    for (const key of Object.keys(prev)) {
      if (!PCore.isDeepEqual(next[key], prev[key])) {
        return false;
      }
    }
  }

  return !routingInfoCompare(next, prev);
};

export const PConnectStore = signalStore(
  // Default identification (no 'providedIn: root' - usage is per-component instance)

  // 1. Core State
  withState({
    pConn: undefined as any,
    props: {} as any, // The resolved props ready for template binding
    additionalPropsConfig: undefined as any // Config for extra props (object or function)
  }),

  // 2. Computed Props (Selectors)
  withComputed(store => ({
    // Common helpers used in templates, computed from 'props'
    label: computed(() => store.props()?.label),
    value: computed(() => store.props()?.value),
    visibility: computed(() => store.props()?.visibility !== false),
    required: computed(() => store.props()?.required === true),
    readOnly: computed(() => store.props()?.readOnly === true),
    disabled: computed(() => store.props()?.disabled === true),
    helperText: computed(() => store.props()?.helperText),
    testId: computed(() => store.props()?.testId)
  })),

  // 3. Methods (Mutators & Logic)
  withMethods(store => {
    // Private: calculate new props from PCore state
    const resolveNewProps = (pConn: any, additionalPropsConfig: any): any => {
      if (!pConn) return {};

      let addProps = {};
      const obj = {};

      if (typeof additionalPropsConfig === 'object') {
        addProps = pConn.resolveConfigProps(additionalPropsConfig);
      } else if (typeof additionalPropsConfig === 'function') {
        const state = PCore.getStore().getState();
        addProps = pConn.resolveConfigProps(additionalPropsConfig(state, () => pConn)); // Pass getter for pConn
      }

      pConn.getConfigProps(obj);

      // populate additional props which are component specific and not present in configurations
      // This block can be removed once all these props will be added as part of configs
      pConn.populateAdditionalProps(obj);

      return {
        ...obj,
        ...addProps
      };
    };

    // Private: Check update
    const handleStoreUpdate = () => {
      const pConn = store.pConn();
      const currentProps = store.props();
      const additionalConfig = store.additionalPropsConfig();

      if (pConn) {
        const nextProps = resolveNewProps(pConn, additionalConfig);

        // Check if update is necessary
        if (!areStatePropsEqual(currentProps, nextProps, pConn)) {
          patchState(store, { props: nextProps });
        }
      }
    };

    return {
      // Action: Connect component to Redux (Initialization)
      connect(pConnSignal: () => any, additionalPropsConfig?: any) {
        // Store the config
        patchState(store, { additionalPropsConfig });

        // 1. React to pConn input changes (when parent updates input)
        const injector = inject(Injector);
        effect(
          () => {
            const pConn = pConnSignal();
            if (pConn) {
              const nextProps = resolveNewProps(pConn, additionalPropsConfig);
              // Always update initially or when pConn reference changes
              patchState(store, { pConn, props: nextProps });
            }
          },
          { injector }
        );

        // 2. Subscribe to Global Redux Store (Zoneless)
        // Access DestroyRef from the component context (where this connect() is called)
        const destroyRef = inject(DestroyRef);
        const unsubscribe = PCore.getStore().subscribe(() => {
          handleStoreUpdate();
        });

        // Register cleanup
        destroyRef.onDestroy(() => {
          unsubscribe();
        });
      },

      // Exposed for manual refresh if needed
      tick: handleStoreUpdate
    };
  })
);
