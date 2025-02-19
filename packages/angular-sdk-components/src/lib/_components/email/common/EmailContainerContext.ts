/*
 * Copyright (c) 2023 Pegasystems Inc.
 * All rights reserved.
 * Please find more details under the LICENSE file in the root directory of this source tree.
 */
/*
 * This is used as a Utility that holds functions related to context on which email case is loaded.
 */
import { getCanPerformFromAssignments } from './utils';
import { EMAIL_TRIAGE_SHARED_STORE } from './Constants';

export const getEmailContainerContextFromPrimary = () => {
  const primaryContainerContext = PCore.getContainerUtils().getActiveContainerItemName('app/primary');
  return PCore.getContainerUtils().getActiveContainerItemName(`${primaryContainerContext}/EmailTriageContainer`);
};

export const doCaseDataExist = (sharedStateName = EMAIL_TRIAGE_SHARED_STORE) => {
  /*
  This key is set in EmailHeader component which is only available in EmailManagerPortal / EmailCaseView
  */
  return !!PCore.getStateUtils().getSharedState(sharedStateName);
};
export const isCaseInSharedContext = (caseInsKey, sharedStateName = EMAIL_TRIAGE_SHARED_STORE) => {
  if (doCaseDataExist(sharedStateName)) {
    const caseListInContext = PCore.getStateUtils().getSharedState(sharedStateName);
    return caseListInContext.includes(caseInsKey);
  }
  return false;
};

export const addCaseToSharedContext = (caseInsKey, sharedStateName = EMAIL_TRIAGE_SHARED_STORE) => {
  let caseListInContext: string[] = [];
  if (doCaseDataExist(sharedStateName)) {
    caseListInContext = Object.assign([], PCore.getStateUtils().getSharedState(sharedStateName));
  }
  caseListInContext.push(caseInsKey);
  PCore.getStateUtils().setSharedState(sharedStateName, caseListInContext);
};

export const removeFromEmailManagerContext = (caseInsKey, sharedStateName = EMAIL_TRIAGE_SHARED_STORE) => {
  let caseListInContext = [];
  if (doCaseDataExist(sharedStateName)) {
    caseListInContext = Object.assign([], PCore.getStateUtils().getSharedState(sharedStateName));
  }
  const CaseListFiltered = caseListInContext.filter(caseKey => caseKey !== caseInsKey);
  PCore.getStateUtils().setSharedState(sharedStateName, CaseListFiltered);
};

/*
Used to decide if Email Case is opened in primary container or not
Returns true only if above condition is true
*/
export const isPrimaryContainerEmail = CaseInsKey => {
  const primaryContainer = PCore.getContainerUtils().getActiveContainerItemName('app/primary') as string;
  const caseID = PCore.getStoreValue('caseInfo.ID', '', primaryContainer);
  return caseID === CaseInsKey;
};

/*
Used to decide if Email Case is opened in Email Manager or as Standalone Case
Return True if any one of above condition is true
*/
export const isContextEmail = CaseInsKey => {
  return isCaseInSharedContext(CaseInsKey) || isPrimaryContainerEmail(CaseInsKey);
};

export const getEmailContainerContext = () => {
  /*
  UseCase : When Inbox page is Landing Page in Email Manager Portal
  Get if app/EmailTriageContainer is present or not.
  */
  let emailTriageContainerContext = PCore.getContainerUtils().getActiveContainerItemName('app/EmailTriageContainer');
  /*
  UseCase : When Inbox page is not First Page in Email Manager Portal then we have app/primary_{NUMBER}/EmailTriageContainer
  Get if app/primary_{NUMBER}/EmailTriageContainer is present or not.
  */
  if (emailTriageContainerContext === undefined || emailTriageContainerContext === null) {
    emailTriageContainerContext = getEmailContainerContextFromPrimary();
    /*
      UseCase : When EmailTriage is opened in CaseManager, Email will be in Primary Container
      Get if app/Primary is present or not.
      */
    if (emailTriageContainerContext === undefined || emailTriageContainerContext === null) {
      emailTriageContainerContext = PCore.getContainerUtils().getActiveContainerItemName('app/primary');
    }
  }
  return emailTriageContainerContext;
};

/*
UseCase : When  EmailContainer is on Service Case or Interaction getting CanPerform from Assignments
Retuns true if there is assignemnt & CanPerform in assignment is 'true'
*/
export const getCanPerform = () => {
  const primaryContainer = PCore.getContainerUtils().getActiveContainerItemName('app/primary') as string;
  const assignments = PCore.getStoreValue('caseInfo.assignments', '', primaryContainer);
  const caseID = PCore.getStoreValue('caseInfo.ID', '', primaryContainer);
  if (assignments) {
    return getCanPerformFromAssignments(assignments, caseID);
  }
  return false;
};
