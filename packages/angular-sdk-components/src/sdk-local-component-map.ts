// Statically load all "local" components that aren't yet in the npm package

import { EmailCaseViewContainerComponent } from './lib/_components/email/email-case-view-container/email-case-view-container.component';
import { EmailContainerComponent } from './lib/_components/email/email-container/email-container.component';
import { EmailHeaderComponent } from './lib/_components/email/email-header/email-header.component';
import { EmailTriageHolderComponent } from './lib/_components/email/email-triage-holder/email-triage-holder.component';

/* import end - DO NOT REMOVE */

// localSdkComponentMap is the JSON object where we'll store the components that are
// found locally. If not found here, we'll look in the Pega-provided component map

const localSdkComponentMap = {
  /* map end - DO NOT REMOVE */
  EmailCaseViewContainer: EmailCaseViewContainerComponent,
  EmailTriageHolder: EmailTriageHolderComponent,
  EmailHeader: EmailHeaderComponent,
  EmailContainer: EmailContainerComponent
};

export default localSdkComponentMap;
