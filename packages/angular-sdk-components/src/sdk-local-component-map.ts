// Statically load all "local" components that aren't yet in the npm package
import { MediacoListViewComponent } from 'packages/Mediaco-overrides/mediaco-list-view/mediaco-list-view.component';

/* import end - DO NOT REMOVE */

// localSdkComponentMap is the JSON object where we'll store the components that are
// found locally. If not found here, we'll look in the Pega-provided component map

const localSdkComponentMap = {
  /* map end - DO NOT REMOVE */
  ListView: MediacoListViewComponent
};

export default localSdkComponentMap;
