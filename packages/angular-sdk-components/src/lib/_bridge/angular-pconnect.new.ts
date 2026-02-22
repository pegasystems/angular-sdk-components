import { Injectable, Signal, signal, DestroyRef, inject, effect } from '@angular/core';
import { shallowEqual } from 'shallow-equal';

// Bridge to global PCore/PConnect
declare const PCore: any;

const isClassIDCompare = (key, prev, next) => {
  return !(key === 'classID' && (!prev[key] || !next[key]));
};

const routingInfoCompare = (next, prev) => {
  return 'routingInfo' in next && (!shallowEqual(next.routingInfo, prev.routingInfo) || !PCore.isDeepEqual(next.routingInfo, prev.routingInfo));
};

@Injectable({ providedIn: 'root' })
export class AngularPConnectService {
  /**
   * Creates a reactive Signal for a component's props.
   * - Subscribes to the Global Redux Store.
   * - Reacts to pConn signal changes.
   * - ONLY updates the Signal if the values have ACTUALLY changed (Deep Compare).
   */
  createPropsSignal(pConnSignal: Signal<any>, additionalProps?: any): Signal<any> {
    const destroyRef = inject(DestroyRef);

    // Create initial state signal
    const propsSignal = signal<any>(
      {},
      {
        equal: (prev, next) => {
          let pConn;
          try {
            pConn = pConnSignal();
          } catch {
            return false;
          }

          if (!pConn) {
            return false;
          }

          // Use the component's state props as the source of truth for keys to compare
          const allStateProps = pConn.getStateProps();

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
          /* TODO For some rawConfig we are not getting routingInfo under allStateProps */
          return !routingInfoCompare(next, prev);
        }
      }
    );

    const updateFromStore = () => {
      let pConn;
      try {
        pConn = pConnSignal();
      } catch {
        return;
      }

      if (pConn) {
        let addProps = {};
        const obj = {};

        // Resolve additional props if provided
        if (additionalProps) {
          if (typeof additionalProps === 'object') {
            addProps = pConn.resolveConfigProps(additionalProps);
          } else if (typeof additionalProps === 'function') {
            const state = PCore.getStore().getState();
            addProps = pConn.resolveConfigProps(additionalProps(state, () => pConn));
          }
        }

        // Populate base config props
        pConn.getConfigProps(obj);

        // Populate additional props which are component specific and not present in configurations
        // This block can be removed once all these props will be added as part of configs
        pConn.populateAdditionalProps(obj);

        const newProps = {
          ...obj,
          ...pConn.getActions(), // Merge actions (onChange, onBlur, etc.)
          ...addProps
        };

        propsSignal.set(newProps);
      }
    };

    // 1. Subscribe to Global Redux Store
    // This runs zonelessly.
    const unsubscribeStore = PCore.getStore().subscribe(() => {
      // Run update logic
      updateFromStore();
    });

    // 2. React to pConn input changes using an effect
    // This ensures that if the parent swaps the pConn object, we update immediately.
    // Effect runs asynchronously.
    effect(() => {
      try {
        pConnSignal();
      } catch {
        /* Ignore if input not ready */
      }
      updateFromStore();
    });

    // 3. Automatic Cleanup
    destroyRef.onDestroy(() => {
      unsubscribeStore();
    });

    return propsSignal.asReadonly();
  }
}
