import { Type } from '@angular/core';
import { componentClassCache, componentLoaders } from './sdk-pega-component-map';
import { ErrorBoundaryComponent } from '../../_components/infra/error-boundary/error-boundary.component';

export let SdkComponentMap: ComponentMap;
let SdkComponentMapCreateInProgress = false;

interface ISdkComponentMap {
  localComponentMap: object;
  pegaProvidedComponentMap: object;
}

/**
 * Helper singleton class to assist with loading and
 * accessing the SDK components.
 *
 * Creates a singleton for this class (with async loading of the components map file) and exports it.
 *
 * Note: Initializing SdkComponentMap to null seems to cause compile issues with references
 * within other components and the value potentially being null, so try to leave it undefined.
 */
class ComponentMap {
  sdkComponentMap: ISdkComponentMap;
  isComponentMapLoaded: boolean;

  constructor() {
    // sdkComponentMap is top-level object
    this.sdkComponentMap = { localComponentMap: {}, pegaProvidedComponentMap: {} };

    // isComponentMapLoaded will be updated to true after the async load is complete
    this.isComponentMapLoaded = false;

    // Initialize the local and Pega-provided component maps as empty objects.
    // These will later be populated with components either defined locally or provided by Pega.
    this.sdkComponentMap.localComponentMap = {};
    this.sdkComponentMap.pegaProvidedComponentMap = {};
  }

  /**
   * Asynchronous initialization of the config file contents.
   * @returns Promise of config file fetch
   */
  async readSdkComponentMap(inLocalSdkComponentMap = {}) {
    return new Promise(resolve => {
      if (
        Object.keys(this.sdkComponentMap.localComponentMap).length === 0 &&
        Object.keys(this.sdkComponentMap.pegaProvidedComponentMap).length === 0
      ) {
        this.readLocalSdkComponentMap(inLocalSdkComponentMap)
          .then(() => {
            resolve(this.sdkComponentMap);
          })
          .catch(error => {
            console.error(`Error in readSdkComponentMap: ${error}`);
          });
      } else {
        resolve(this.sdkComponentMap);
      }
    });
  }

  async readLocalSdkComponentMap(inLocalSdkComponentMap = {}) {
    if (Object.entries(this.getLocalComponentMap()).length === 0) {
      this.sdkComponentMap.localComponentMap = inLocalSdkComponentMap;
    }
    return Promise.resolve(this);
  }

  async readPegaSdkComponentMap(inPegaSdkComponentMap = {}) {
    if (Object.entries(this.getPegaProvidedComponentMap()).length === 0) {
      this.sdkComponentMap.pegaProvidedComponentMap = inPegaSdkComponentMap;
    }
    return Promise.resolve(this);
  }

  getLocalComponentMap = () => {
    return this.sdkComponentMap.localComponentMap;
  };

  setLocalComponentMap(inLocalSdkComponentMap) {
    this.sdkComponentMap.localComponentMap = inLocalSdkComponentMap;
    return this.sdkComponentMap.localComponentMap;
  }

  getPegaProvidedComponentMap = () => {
    return this.sdkComponentMap.pegaProvidedComponentMap;
  };

  setPegaProvidedComponentMap = inPegaProvidedComponentMap => {
    this.sdkComponentMap.pegaProvidedComponentMap = inPegaProvidedComponentMap;
    return this.sdkComponentMap.pegaProvidedComponentMap;
  };
}

/**
 * Implement Factory function to allow async load.
 */
async function createSdkComponentMap(inLocalComponentMap = {}) {
  // Note that our initialize function returns a promise...
  const singleton = new ComponentMap();
  await singleton.readSdkComponentMap(inLocalComponentMap);
  return singleton;
}

/**
 * Retrieves the singleton SDK component map, creating it if necessary.
 *
 * This function ensures that only one instance of the SDK component map exists.
 * If the map is not yet initialized, it triggers its creation and resolves once ready.
 * If the map is already being created by another call, it waits until the map is available.
 * Once the map is created, a `SdkComponentMapReady` event is dispatched on the document.
 *
 * @param inLocalComponentMap - An optional object to use as the initial local component map.
 * @returns A promise that resolves to the SDK component map instance.
 */
export async function getSdkComponentMap(inLocalComponentMap = {}) {
  return new Promise(resolve => {
    let idNextCheck;
    if (!SdkComponentMap && !SdkComponentMapCreateInProgress) {
      SdkComponentMapCreateInProgress = true;
      createSdkComponentMap(inLocalComponentMap).then(theComponentMap => {
        // Key initialization of SdkComponentMap
        SdkComponentMap = theComponentMap;
        SdkComponentMapCreateInProgress = false;
        // Create and dispatch the SdkConfigAccessReady event
        // Not used anyplace yet but putting it in place in case we need it.
        const event = new CustomEvent('SdkComponentMapReady', {});
        document.dispatchEvent(event);
        return resolve(SdkComponentMap);
      });
    } else {
      const fnCheckForConfig = () => {
        if (SdkComponentMap) {
          if (idNextCheck) {
            clearInterval(idNextCheck);
          }
          return resolve(SdkComponentMap.sdkComponentMap);
        }
        idNextCheck = setInterval(fnCheckForConfig, 500);
      };
      if (SdkComponentMap) {
        return resolve(SdkComponentMap.sdkComponentMap);
      }
      idNextCheck = setInterval(fnCheckForConfig, 500);
    }
  });
}

/**
 * Retrieves the component implementation associated with the given component name.
 *
 * This function first attempts to find the component in the local component map.
 * If not found, it checks the Pega-provided component map. If the component is
 * not found in either map, it logs an error and recursively attempts to return
 * the 'ErrorBoundary' component implementation as a fallback.
 *
 * @param inComponentName - The name of the component to retrieve.
 * @returns The implementation of the requested component, or the ErrorBoundary component if not found.
 */
export function getComponentFromMap(inComponentName: string): any {
  let theComponentImplementation = null;
  const theLocalComponent = SdkComponentMap.getLocalComponentMap()[inComponentName];
  if (theLocalComponent !== undefined) {
    theComponentImplementation = theLocalComponent;
  } else {
    const thePegaProvidedComponent = SdkComponentMap.getPegaProvidedComponentMap()[inComponentName];
    if (thePegaProvidedComponent !== undefined) {
      theComponentImplementation = thePegaProvidedComponent;
    } else {
      console.error(`Requested component has neither Local nor Pega-provided implementation: ${inComponentName}`);
      theComponentImplementation = getComponentFromMap('ErrorBoundary');
    }
  }
  return theComponentImplementation;
}

/**
 * Dynamically loads an Angular component class by its logical name.
 * Uses a cache to avoid re-importing components during the session.
 * Falls back to ErrorBoundaryComponent if the requested component is unknown or fails to load.
 *
 * @param name The logical component name (as used in metadata or input).
 * @returns A Promise resolving to the Angular component class (Type<any>).
 */
export async function getComponentClassAsync(name: string): Promise<Type<any>> {
  // Use 'ErrorBoundary' as a fallback if name is empty or undefined
  const safeName = name || 'ErrorBoundary';

  // Return cached class if already loaded
  if (componentClassCache[safeName]) {
    return componentClassCache[safeName];
  }

  // Get the loader function for the component
  const loader = componentLoaders[safeName];
  if (!loader) {
    // If component is unknown, fallback to ErrorBoundary
    return getComponentClassAsync('ErrorBoundary');
  }

  try {
    // Dynamically import and cache the component class
    const cls = await loader();
    componentClassCache[safeName] = cls;
    return cls;
  } catch (e) {
    // Log error and fallback to ErrorBoundary if loading fails

    console.error('Dynamic import failed for', safeName, e);
    if (safeName !== 'ErrorBoundary') {
      return getComponentClassAsync('ErrorBoundary');
    }
    // If ErrorBoundary itself fails, return the static ErrorBoundaryComponent
    return ErrorBoundaryComponent;
  }
}
