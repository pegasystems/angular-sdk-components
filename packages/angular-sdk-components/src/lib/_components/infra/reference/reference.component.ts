import { Component } from '@angular/core';

/**
 * WARNING: It is not expected that this file should be modified.  It is part of infrastructure code that works with
 * Redux and creation/update of Redux containers and PConnect.  Modifying this code could have undesireable results and
 * is totally at your own risk.
 */

@Component({
  selector: 'app-reference',
  templateUrl: './reference.component.html',
  styleUrls: ['./reference.component.scss'],
  standalone: true
})
export class ReferenceComponent {
  /* Used to toggle some class-wide logging */
  private static bLogging = false;

  /**
   * Creates a normalized PConn from a reference component.
   * Resolves the reference to its fully realized View with proper configuration.
   *
   * @param inPConn - The PConn object that represents a reference component
   * @returns The dereferenced PConnect object, or null if reference can't be resolved
   */
  static createFullReferencedViewFromRef(inPConn: any): any {
    // Validate that inPConn is a reference component
    if (inPConn.getComponentName() !== 'reference') {
      console.error(`Reference component: createFullReferencedViewFromRef inPConn is NOT a reference! ${inPConn.getComponentName()}`);
      return null;
    }

    // Get reference configuration and make a copy
    const referenceConfig = { ...inPConn.getComponentConfig() };

    // Remove properties that should not be inherited by the referenced view
    // (Maintained from React SDK implementation)
    delete referenceConfig?.name;
    delete referenceConfig?.type;
    delete referenceConfig?.visibility;

    // Get the metadata for the referenced view
    const viewMetadata = inPConn.getReferencedView();

    // Return null if view metadata is not found
    if (!viewMetadata) {
      console.log('View not found ', inPConn.getComponentConfig());
      return null;
    }

    // Create the view object by merging metadata with reference config
    const viewObject = {
      ...viewMetadata,
      config: {
        ...viewMetadata.config,
        ...referenceConfig
      }
    };

    // Resolve configuration properties
    const resolvedConfigProps = inPConn.resolveConfigProps(inPConn.getConfigProps());
    const { visibility = true, context, readOnly = false, displayMode = '' } = resolvedConfigProps;

    // Log debug information if logging is enabled
    if (ReferenceComponent.bLogging) {
      console.log(`Reference: about to call createComponent with pageReference: context: ${inPConn.getContextName()}`);
    }

    // Create the component with the right context
    const viewComponent = inPConn.createComponent(viewObject, null, null, {
      pageReference: context && context.startsWith('@CLASS') ? '' : context
    });

    if (referenceConfig.inheritedProps && referenceConfig.inheritedProps.length > 0) {
      const inheritedProps = inPConn.getInheritedProps();
      referenceConfig.inheritedProps = Object.keys(inheritedProps).map(prop => ({ prop, value: inheritedProps[prop] }));
    }

    // Get the PConnect object from the created component
    const newCompPConnect = viewComponent.getPConnect();

    // Set inherited configuration on the new component
    newCompPConnect.setInheritedConfig({
      ...referenceConfig,
      readOnly,
      displayMode
    });

    // Log debug information if logging is enabled
    if (ReferenceComponent.bLogging) {
      console.log(
        `Angular Reference component: createFullReferencedViewFromRef -> newCompPConnect configProps: ${JSON.stringify(
          newCompPConnect.getConfigProps()
        )}`
      );
    }

    // Return the component if it should be visible, otherwise null
    return visibility !== false ? newCompPConnect : null;
  }

  /**
   * Normalizes a PConn object that might be a 'reference'.
   * If the incoming PConn is a reference, returns its dereferenced View.
   * Otherwise, returns the passed in PConn unchanged.
   *
   * @param inPConn - A PConn object (ex: { getPConnect() } or direct PConnect)
   * @returns The normalized PConn object with references resolved
   */
  static normalizePConn(inPConn: any): any {
    // Early return for null or undefined input
    if (!inPConn) {
      return inPConn;
    }

    // Determine if we have an object with getPConnect method or direct PConnect
    const hasGetPConnectMethod = !!inPConn.getPConnect;

    // Get the component name in the appropriate way based on the object type
    const componentName = hasGetPConnectMethod ? inPConn.getPConnect().getComponentName() : inPConn.getComponentName();

    // Only process if this is a reference component
    if (componentName === 'reference') {
      if (hasGetPConnectMethod) {
        // For objects with getPConnect method, get the referenced view and its component
        const refViewPConn = this.createFullReferencedViewFromRef(inPConn.getPConnect());
        return refViewPConn?.getComponent();
      }

      // For direct PConnect objects, just create the referenced view
      return this.createFullReferencedViewFromRef(inPConn);
    }

    // Not a reference component, return unchanged
    return inPConn;
  }

  /**
   * Normalizes an array of PConn objects by replacing any 'reference' components
   * with their referenced views.
   *
   * @param inPConnArray - Array of PConn objects to normalize
   * @returns Normalized array with references resolved, or empty array if input is invalid
   */
  static normalizePConnArray(inPConnArray: any[]): any[] {
    // Handle null, undefined, or empty array case
    if (!inPConnArray?.length) {
      return inPConnArray || [];
    }

    // Process array: normalize each item and filter out any null/undefined results
    const normalizedArray = inPConnArray.map(child => ReferenceComponent.normalizePConn(child)).filter(Boolean);

    // Ensure we always return an array (even if filter removes all items)
    return normalizedArray || [];
  }
}
