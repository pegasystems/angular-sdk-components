import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProgressSpinnerService } from 'packages/angular-sdk-components/src/public-api';
import { UPDATE_CASE_IN_LIST, UPDATE_SUBJECT_BY_CASE, UPDATE_UTILITY_COUNT } from '../common/PubSubEvents';
import getRecipient, { getRecipientList } from '../common/recipients';
import { escapeHTML, getEmailBody } from '../common/Container';
import { updateImageSrcsWithAbsoluteURLs } from '../common/utils';
import { getCanPerform, isContextEmail } from '../common/EmailContainerContext';
import { EMAIL_ACTIONS } from '../common/Constants';
import { EmailComposerContainerComponent } from '../email-composer-container/email-composer-container.component';
import { Observable, of } from 'rxjs';

interface IMetadata {
  readOnlyView?: boolean;
  isSpamEmail?: boolean;
  runTimeFeedback?: any;
  suggestedReplies?: any;
  otherReplies?: any;
}

const setDraftUndeliveredStatus = (thread, draftAndUndeliveredStatus) => {
  if (thread.pyDraftsCount > 0 && !draftAndUndeliveredStatus.hasDraft) {
    draftAndUndeliveredStatus.hasDraft = true;
  }
  if (thread.pyUndeliveredMessage !== null && !draftAndUndeliveredStatus.hasUndelivered) {
    draftAndUndeliveredStatus.hasUndelivered = false;
  }
  return draftAndUndeliveredStatus;
};

const getEntityListFromMail = email => {
  return email.pyEntities?.map(entity => {
    return {
      value: entity.pyEntityLabel,
      variant: Number(entity.pyEntityColorCode),
      type: entity.pyEntityModelName,
      names: entity.pyEntityName.split(',')
    };
  });
};

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  readonly dialog = inject(MatDialog);

  caseInsKey: string;
  showContainerHeader: boolean;
  emailContainerPConnect: any;

  // stores raw email data
  emails = [];
  // stores email threads
  emailThreads = [];

  subject = '';

  metadata: IMetadata = {};
  replyTemplates = [];

  previewAttachment = [];
  attachItem = [];

  fetchingNewEmails = false;
  accordionExpandStatus: any = [];
  lastCount;
  etUpdated = '';
  boolHideEntities;

  isEmailClient;

  private emailComposerRef;

  constructor(private psService: ProgressSpinnerService) {
    console.log('EmailService');
  }

  clear() {
    this.emails = [];
    this.emailThreads = [];
    this.metadata = {};
    this.replyTemplates = [];
    this.previewAttachment = [];
    this.attachItem = [];
    this.fetchingNewEmails = false;
    this.accordionExpandStatus = [];
    this.lastCount = null;
    this.etUpdated = '';
    this.boolHideEntities = null;
  }

  public async getMetadata() {
    const emailTriageMetadata = await PCore.getDataApiUtils().getData('D_pxTriageCaseMetadata', {
      dataViewParameters: {
        CaseInsKey: this.caseInsKey
      }
    });

    if (emailTriageMetadata.data.data[0] !== undefined) {
      const { pyChannelID, pyIsEditEnabled, pxIsSpamEmail, pyRuntimeFeedback, pySuggestedReplies, pyOtherReplyTemplates } =
        emailTriageMetadata.data.data[0];

      this.metadata.readOnlyView = !pyIsEditEnabled;
      this.metadata.isSpamEmail = !!pxIsSpamEmail;
      this.metadata.runTimeFeedback = pyRuntimeFeedback;
      if (pySuggestedReplies || pyOtherReplyTemplates) {
        const payload = { ChannelId: pyChannelID };

        const { data } = await PCore.getDataApiUtils().getData('D_pxEmailSuggestedReplyTemplates', {
          dataViewParameters: payload
        });
        this.replyTemplates = data;
        this.metadata.suggestedReplies = pySuggestedReplies;
        this.metadata.otherReplies = pyOtherReplyTemplates;
      }
    }

    this.getEmailThreads();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sendEmail(payload: any): Observable<any> {
    // Logic to send email
    return of({ status: 'success' }); // Replace with actual HTTP call
  }

  private async getEmailThreads() {
    console.log('EmailContainerComponent: getEmailThreads');

    this.psService.sendMessage(true);
    this.previewAttachment = [];
    this.attachItem = [];

    console.log('Getting Email Threads');

    this.fetchingNewEmails = true;

    const emailThreadsResponse = await PCore.getDataApiUtils().getData('D_pxEmailThreads', {
      dataViewParameters: {
        CaseInsKey: this.caseInsKey,
        CaseClass: 'Work-Channel-Triage-Email',
        IsApiContext: true as any
      }
    });

    this.emails = emailThreadsResponse?.data?.data ?? [];

    this.createEmailThreads();
    this.fetchingNewEmails = false;
    this.psService.sendMessage(false);
    // below code is commented out because it GENAI is not implemented in the SDK
    // PCore.getPubSubUtils().publish(PUSH_GENAI_REPLIES);
  }

  private createEmailThreads(doMakeReadOnly = false) {
    const tempThreads: any = [];
    let count = 0;
    let draftAndUndeliveredStatus: any = {
      hasDraft: false,
      hasUndelivered: false,
      assignID: this.emailContainerPConnect.getCaseInfo().getAssignmentID()
    };

    this.emails.forEach((thread: any) => {
      const emailConversation: any = [];
      draftAndUndeliveredStatus = setDraftUndeliveredStatus(thread, draftAndUndeliveredStatus);

      thread.pxResults.forEach(email => {
        const tempEmail: any = this.getEmailConversation(email, doMakeReadOnly);
        if (email.pyFromChannel === 'Email') {
          tempEmail.sentiment = {
            variant: email.pyMessageMetadata.pySentiment
          };
        }
        this.setEmailStatus(email, tempEmail);
        // setReplyAllAction(email, tempEmail, doMakeReadOnly);
        emailConversation.push(tempEmail);
        count += 1;
      });

      const threadID = `${emailConversation[emailConversation.length - 1].id}_id`;
      const tempThread = {
        id: threadID,
        emails: emailConversation,
        unReadEmailCount: thread.pyUnreadEmailsCount,
        timeStamp: thread.pxUpdateDateTime,
        isForwarded: !thread.pyIsMainThread,
        from: emailConversation[emailConversation.length - 1].from,
        to: emailConversation[emailConversation.length - 1].to,
        isCollapsed: !this.getExpandStatus(threadID)
      };

      // pyIsMainThread is true only if it is an email from customer
      this.setPropertiesFromThread(thread, tempThread);

      if (tempThread.isForwarded && tempThread.emails.length > 0) {
        tempThread.emails[tempThread.emails.length - 1].from.avatarProps = {
          icon: 'headset'
        };
        delete tempThread.emails[tempThread.emails.length - 1].sentiment;
      }
      tempThreads.push(tempThread);
    });

    /* Expand first accordion after forwarding a mail */
    if (Boolean(this.lastCount) && count !== this.lastCount) {
      tempThreads[0].isCollapsed = false;
      this.setExpandStatus(tempThreads[0].id, true);
    }
    this.lastCount = count;
    this.emailThreads = tempThreads;
    this.setEmailAsRead();
    PCore.getPubSubUtils().publish(UPDATE_CASE_IN_LIST, draftAndUndeliveredStatus);
  }

  private getEmailConversation(email, doMakeReadOnly) {
    let entitiesList = [];
    const entityMapContextHandle = email.pyFromChannel === 'Email' ? null : undefined;
    if (email.pyAttachmentsOnContext !== undefined) {
      PCore.getPubSubUtils().publish(PCore.getEvents().getCaseEvent().CASE_ATTACHMENTS_UPDATED_FROM_CASEVIEW, true);
    }
    if (email.pyEntities !== undefined) {
      entitiesList = getEntityListFromMail(email);
    }

    return this.createEmailConversation(email, entitiesList, entityMapContextHandle, doMakeReadOnly);
  }

  private setEmailStatus(email, tempEmail) {
    if (email.pyHasEmailDraft) {
      tempEmail.status = 'draft';
    }

    // undelivered --pending
    // else if (email.pyUndeliveredEmailCount > 0) {
    //   tempEmail.status = 'undelivered';
    // }
  }

  /* Storing into accordionExpandStatus only if accordion is expanded */
  public getExpandStatus(id) {
    return this.accordionExpandStatus.includes(id);
  }

  public setExpandStatus(id, doExpand) {
    const indexOfAccordion = this.accordionExpandStatus.indexOf(id);
    if (doExpand) {
      if (indexOfAccordion === -1) {
        this.accordionExpandStatus.push(id);
      }
    } else if (indexOfAccordion !== -1) {
      this.accordionExpandStatus.splice(indexOfAccordion, 1);
    }
  }

  private setPropertiesFromThread(thread, tempThread) {
    if (thread.pyIsMainThread === true) {
      const tempSubject = tempThread.emails[tempThread.emails.length - 1].subject;
      this.subject = tempSubject;
      PCore.getPubSubUtils().publish(`${UPDATE_SUBJECT_BY_CASE}_${this.caseInsKey}`, tempSubject);
    }
  }

  private async setEmailAsRead() {
    if (this.fetchingNewEmails) {
      await PCore.getDataApiUtils().getData('D_pxSetEmailReadStatus', {
        dataViewParameters: {
          CaseInsKey: this.caseInsKey,
          IsRead: true as any
        }
      });
      PCore.getPubSubUtils().publish('MarkEmailTriageAsRead', { assignID: this.emailContainerPConnect.getCaseInfo().getAssignmentID() });
      if (this.etUpdated == 'ET_Updated') {
        PCore.getPubSubUtils().publish(UPDATE_UTILITY_COUNT, {});
        this.etUpdated = '';
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private createEmailConversation(email, entitiesList, entityMapContextHandle, doMakeReadOnly) {
    const emailConversation: any = {
      id: email.pyID,
      timeStamp: email.pxCreateDateTime,
      from: getRecipient(email.pyMessageMetadata, email.pyFromChannel),
      to: getRecipientList(email.pyMessageMetadata.pyToRecipientList, email.pyFromChannel),
      cc: getRecipientList(email.pyMessageMetadata.pyCCRecipientList, email.pyFromChannel),
      bcc: getRecipientList(email.pyMessageMetadata.pyBCCRecipientList, email.pyFromChannel),
      subject: escapeHTML(email.pyMessageMetadata.pySubject),
      body: getEmailBody(email.pyEmailBody, this.emailContainerPConnect),
      prevMessageKey: email.pxPrevMessageKey,
      entityHighlightMapping: this.boolHideEntities ? entitiesList : [],
      tempEntityHighlightMapping: !this.boolHideEntities ? entitiesList : [],
      unRead: email.pyMessageMetadata.pyIsUnread
      // onEditDraft: doMakeReadOnly ? undefined : this.getEditDraftAction(email),
      // onDeleteDraft: doMakeReadOnly ? undefined : getDeleteDraftAction(email),
      // onReply: doMakeReadOnly ? undefined : getReplyAction(email),
      // onReplyAll: doMakeReadOnly ? undefined : getReplyAllAction(email),
      // onForward: doMakeReadOnly ? undefined : getForwardAction(email),
      // attachments: getAttachments(email.pyAttachmentsOnContext, pConn, email.pyMessageMetadata.pyIsSpamEmail, onSpamAttachClick),
      // suggestions: doMakeReadOnly ? undefined : getSuggestions(email),
      // onSuggestionClick: (id, suggestionId) => {
      //   openEmailComposerOnSuggestion(email, id, suggestionId, email.pyMessageMetadata.pySubject);
      // },
      // contextMenu: getContextMenu(email, entityMapContextHandle)
    };

    // Looping over the attachments so as to set the onPreview function and data set for Preview.
    // emailConversation.attachments.forEach((attachment) => {
    //   attachment.onPreview = (id) => {
    //     const currMID = id.substring(0, id.indexOf('!'));
    //     setPreviewAttachments(
    //       attachItem.current.filter((element) => {
    //         let e = element.id;
    //         return e.includes(currMID);
    //       })
    //     );
    //     previewAttachId.current = id;
    //     setOpenLightBox(true);
    //   };
    //   let attachExist = attachItem.current.some((e) => e.id === attachment.id) ? 0 : 1;
    //   attachItem.current =
    //     attachItem.current.length === 0 || attachExist ? [...attachItem.current, attachment] : [attachItem.current];
    // });

    // If conversation is from CSR & is a forwarded email then directly show the content without API call.
    if (email.pxIsOutgoingEmail && email.pzForwardedContent) {
      const tempTrail = {
        content: updateImageSrcsWithAbsoluteURLs(email.pzForwardedContent, this.emailContainerPConnect),
        loading: false,
        expanded: false
        // onExpandCollapse: id => {
        //   onShowFullMessage(id, this.setEmailThreads, this.pConn$);
        // }
      };
      emailConversation.trail = tempTrail;
    } else if (!email.pyHidePrevConversation || (email.pxPrevMessageKey && email.pxPrevMessageKey != '')) {
      // If pzAccessCompleteEmailChain is true then show ellipsis icon.
      const tempTrail = {
        content: '',
        loading: false,
        expanded: false
        // onExpandCollapse: id => {
        //   onShowFullMessage(id, this.setEmailThreads, this.pConn$);
        // }
      };
      emailConversation.trail = tempTrail;
      emailConversation.hasPreviousEmailConversations = true;
    }

    if (email.pyMessageMetadata.pyIsSpamEmail) {
      emailConversation.banner = {
        variant: 'warning',
        messages: [
          {
            label: this.emailContainerPConnect.getLocalizedValue(
              'This email has been identified as potential spam. For your security, please review its content carefully. If you determine this email is safe, you can mark it as '
            ),
            action: {
              text: this.emailContainerPConnect.getLocalizedValue('Not Spam')
              // onClick: () => {
              //   this.markEmailAsSpam(false);
              // }
            }
          }
        ]
      };
    }

    return emailConversation;
  }

  private isReadOnlyMode() {
    if (this.metadata.isSpamEmail) {
      return true;
    }
    if (isContextEmail(this.caseInsKey)) {
      return this.metadata.readOnlyView;
    }
    return !getCanPerform();
  }

  private onReply(email) {
    // if (this.doMakeReadOnly) {
    //   return;
    // }
    if (!email.pyHasEmailDraft && !this.isReadOnlyMode()) {
      this.openEmailComposer(email, 'REPLY');
    }
  }

  private onReplyAll(email) {
    // if (this.doMakeReadOnly) {
    //   return;
    // }
    if (!email.pyHasEmailDraft && !this.isReadOnlyMode()) {
      this.openEmailComposer(email, 'REPLYALL');
    }
  }

  private onForward(email) {
    // if (this.doMakeReadOnly) {
    //   return;
    // }
    if (!email.pyHasEmailDraft && !this.isReadOnlyMode()) {
      this.openEmailComposer(email, 'FORWARD');
    }
  }

  public handleActionClick(action, email) {
    switch (action) {
      case EMAIL_ACTIONS.REPLY:
        this.onReply(email);
        break;
      case EMAIL_ACTIONS.REPLY_ALL:
        this.onReplyAll(email);
        break;
      case EMAIL_ACTIONS.FORWARD:
        this.onForward(email);
        break;
      case EMAIL_ACTIONS.DELETE:
        // this.onDelete(email);
        break;
      case EMAIL_ACTIONS.EDIT:
        // this.onEditDraft(email);
        break;
      default:
        break;
    }
  }

  private openEmailComposer(email, actionType) {
    EmailComposerContainerComponent.prototype.pConn = this.emailContainerPConnect;
    EmailComposerContainerComponent.prototype.context = email.id;
    EmailComposerContainerComponent.prototype.ActionType = actionType;
    this.emailComposerRef = this.dialog.open(EmailComposerContainerComponent, {
      hasBackdrop: false,
      position: { bottom: '10px', right: '10px' },
      minHeight: '600px',
      width: '740px'
    });
  }

  public closeEmailComposer() {
    if (this.emailComposerRef) {
      this.emailComposerRef.close();
    }
  }

  public doShowContainerHeader() {
    if (this.isEmailClient) {
      return false;
    }

    return this.showContainerHeader;
  }
}
