import { BYTES_TO_MB, FORWARD_ACTION_IN_COMPOSER, FORWARDED_CONTENT_DIV, REM_ALL_ADDITIONAL_CONTENT, REPLIED_CONTENT_DIV } from './Constants';
import { updateImageSrcsWithAbsoluteURLs } from './utils';

let payloadTo = [];
let payloadBCC = [];
let payloadCC = [];
const CaseContent = '.caseInfo.content';
const IsOutboundFromPrimary = '.isOutboundFromPrimary';

// const maxAllowedSizeInMB: any = window.PCore.getEnvironmentInfo().getMaxAttachmentSize();
export const largeAttachmentError = pConn => {
  const maxAllowedSizeInMB: any = window.PCore.getEnvironmentInfo().getMaxAttachmentSize();
  return `${pConn.getLocalizedValue('File size exceeding')} ${maxAllowedSizeInMB}${pConn.getLocalizedValue('MB')}`;
};
export const convertToArrayOfEmailAddress = EmailUsers => {
  return EmailUsers.map(Email => {
    return { EmailAddress: Email };
  });
};

export const filterLargeAttachment = attachment => {
  const maxAllowedSizeInMB: any = window.PCore.getEnvironmentInfo().getMaxAttachmentSize();
  return attachment.File && attachment.File.size && attachment.File.size / BYTES_TO_MB >= maxAllowedSizeInMB;
};

function clearComposerErrors(data, param, hasError) {
  data[param].error = '';
  if (!hasError) {
    hasError = false;
  }
}

export const validateInputs = (composerData, data, hasError, isDraftSaved, emptyField, emptyRecipient) => {
  payloadTo = composerData.to.value ? convertToArrayOfEmailAddress(composerData.to.value) : undefined;
  payloadCC = composerData.cc.value ? convertToArrayOfEmailAddress(composerData.cc.value) : undefined;
  payloadBCC = composerData.bcc.value ? convertToArrayOfEmailAddress(composerData.bcc.value) : undefined;
  if (isDraftSaved === false) {
    if (payloadTo.length === 0) {
      data.to.value = [];
      data.to.error = emptyRecipient;
      hasError = true;
    } else {
      clearComposerErrors(data, 'to', hasError);
    }
    if (composerData.bodyContent.defaultValue === '') {
      data.bodyContent.defaultValue = '';
      data.bodyContent.error = emptyField;
      hasError = true;
    } else {
      clearComposerErrors(data, 'bodyContent', hasError);
    }
    if (composerData.subject.value.length === 0) {
      data.subject.value = '';
      data.subject.error = emptyField;
      hasError = true;
    } else {
      clearComposerErrors(data, 'subject', hasError);
    }
  }
  return hasError;
};

export const setAttachmentsToUpload = (attachmentsList, attachmentsToUpload, preExistingAttachments, payloadPreExistAttachments) => {
  if (attachmentsList) {
    attachmentsList.forEach((attachment: any) => {
      if (attachment.File) {
        attachmentsToUpload.push(attachment.File);
      } else {
        preExistingAttachments.forEach(prevAttach => {
          if (prevAttach.name === attachment.name) {
            payloadPreExistAttachments.push({
              ID: prevAttach.id
            });
          }
        });
      }
    });
  }
};

export const getIsInPrimaryContext = () => {
  const primaryContainer = PCore.getContainerUtils().getActiveContainerItemContext('app/primary') ?? '';
  const isOutboundFromPrimary = PCore.getStoreValue(`${CaseContent}${IsOutboundFromPrimary}`, '', primaryContainer);
  return !!isOutboundFromPrimary;
};

export const getCaseId = () => {
  const primaryContainer = PCore.getContainerUtils().getActiveContainerItemContext('app/primary') ?? '';
  if (getIsInPrimaryContext()) {
    /* used when outbound email composer is launched from phone interaction */
    return PCore.getStoreValue('.caseInfo.ID', '', primaryContainer);
  }
  // else if (isInTaskManagerContext()) {

  /* used when outbound email is launched from service case */
  const activeWorkArea = PCore.getContainerUtils().getActiveContainerItemContext(`${primaryContainer}/workarea`) ?? '';
  return PCore.getStoreValue('.caseInfo.ID', '', activeWorkArea);

  /* used in case of initial load :
  There will be no context set & don't know upfront if task manager component exist or not */
  // return PCore.getStoreValue('.caseInfo.ID', '', primaryContainer);
};

export const getSendEmailPayload = (
  composerData,
  actionType,
  payloadPreExistAttachments,
  isOutbound = false,
  caseID = '',
  Context = '',
  templateID = '',
  GUID = ''
) => {
  // eslint-disable-next-line no-nested-ternary
  const CaseId = isOutbound ? (caseID != '' ? caseID : getCaseId()) : caseID;
  return {
    From: isOutbound ? composerData.emailAccount.value : '',
    ReplyAction: actionType,
    CaseId,
    Context,
    TemplateId: templateID,
    Subject: composerData.subject.value,
    Body: composerData.bodyContent.defaultValue,
    // Body: 'FYI',
    GUID,
    ToRecipients: payloadTo,
    CCRecipients: payloadCC,
    BCCRecipients: payloadBCC,
    PreExistingAttachments: payloadPreExistAttachments
  };
};

/* Function to remove forwarded content/replied content within the composer */
export const removeElementWithId = (id, emailContent) => {
  let temp = emailContent;
  if (emailContent.includes(id)) {
    const dummyElement = document.createElement('div');
    dummyElement.innerHTML = emailContent;
    const divToBeRemoved = dummyElement.querySelector(`#${id}`);
    if (divToBeRemoved !== null) {
      divToBeRemoved.remove();
    }
    temp = dummyElement.innerHTML
      .toString()
      .replace(/(\r\n|\n|\r)/gm, '')
      .trim();
  }
  return temp;
};
export const removeAdditionalContent = (emailContent, contentType) => {
  if (contentType === REM_ALL_ADDITIONAL_CONTENT) {
    emailContent = removeElementWithId(FORWARDED_CONTENT_DIV, emailContent);
    emailContent = removeElementWithId(REPLIED_CONTENT_DIV, emailContent);
  }
  if (contentType == FORWARD_ACTION_IN_COMPOSER) {
    emailContent = removeElementWithId(FORWARDED_CONTENT_DIV, emailContent);
  } else {
    emailContent = removeElementWithId(REPLIED_CONTENT_DIV, emailContent);
  }
  return emailContent;
};

/* input: Metadata from TriageCaseMetadata DP, email composer action type
output : Returns additonal content based on email composer action type
*/
export const getReplyOrForwardContent = (metaData, emailActionType, pConn) => {
  let additionalContent = '';
  if (emailActionType == FORWARD_ACTION_IN_COMPOSER && metaData.pyForwardedContent) {
    additionalContent = metaData.pyForwardedContent;
  } else if (metaData.pyRepliedContent) {
    additionalContent = metaData.pyRepliedContent;
  }
  return updateImageSrcsWithAbsoluteURLs(additionalContent, pConn);
};
