/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-ignore
import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { UtilityService } from './utility.service';
import { EmailUtilityContext } from './email-utility.context';
import { EmailComposerComponent } from '../email-composer/email-composer.component';
import { updateImageSrcsWithAbsoluteURLs } from '../common/utils';
import { MatIconModule } from '@angular/material/icon';
import { EmailService } from '../email-service/email.service';

@Component({
  selector: 'app-email-composer-container',
  templateUrl: './email-composer-container.component.html',
  standalone: true,
  imports: [EmailComposerComponent, MatIconModule],
  styleUrls: ['./email-composer-container.component.scss']
})
export class EmailComposerContainerComponent implements OnInit, OnDestroy {
  private emailService: EmailService = inject(EmailService);
  data = inject(MAT_DIALOG_DATA);

  @Input() CaseID: string;
  @Input() TemplateID = '';
  @Input() Replies: any[] = [];
  @Input() IsEmailClient = true;
  @Input() hasSavedDraft = false;
  @Input() isGenAIEnabled = false;
  @Input() setIsActive: (isActive: boolean) => void;
  @Input() GUID: string;
  @Input() body: string;
  @Input() preLoadArticleData: any;

  subscription: Subscription;
  widgets: string[] = [];
  emailContentChanged = false;
  isDraftSaved = false;
  doImplicitDraftSave = false;
  initialLoad = false;
  rephrasedBody = '';
  isPoliteTone = true;
  isComponentMounted = true;
  source = '';
  articleData = '';
  previewAttachId = '';
  isDataLoading = false;
  previewAttachments: any[] = [];
  participants: any[] = [];
  attachmentsList: any[] = [];
  preExistingAttachments: any[] = [];
  composerState: any = {};
  composerStateForDraft: any = {};
  composerHandle: any = null;
  loadingText = 'Loading';
  draftModalMessage = 'You have unsaved changes. You can discard them or go back to keep working.';
  discardChanges = 'Discard changes';
  discardUnsavedChanges = 'Discard unsaved changes?';
  saveAndClose = 'Save & close';
  invalidEmail = 'invalid email address';
  emptyField = 'Field cannot be blank';
  emptyRecipient = 'Please specify at least one recipient';
  goBack = 'Go back';
  rephraseEmail = 'Rephrase with AI';
  proceedToSendEmail = 'Send anyway';
  toneModalHeading = 'Response review';
  errorWithGenAI = false;
  draftWindow: any;
  toneAnalysisWindow: any;
  isShareArticleNotificationReceived = false;
  openLightBox = false;

  composerData = {
    to: { value: [] },
    cc: { value: [] },
    bcc: { value: [] },
    subject: { value: '' },
    bodyContent: {
      defaultValue: '',
      forwardedContent: '',
      repliedContent: ''
    },
    selectedTemplateId: '',
    attachments: [],
    responseType: ''
  };

  utilities: any;
  utilitySummaryIconMapping: any;
  utilitiesSummaries: { iconName: string; count: number; name: string }[];
  isProgress: boolean;
  ccEmailUsers: any;
  bccEmailUsers: any;
  fromRecipients: any;
  replyTemplates: { title: any; id: any; templates: any }[];
  assignID: any;
  Isrephrased: boolean;
  ToneActions: any;
  cancelActions: any;
  toneActions: any;
  isEmailClientRef: any = false;

  constructor(
    private utilityService: UtilityService,
    private emailUtilityContext: EmailUtilityContext
  ) {}

  ngOnInit(): void {
    console.log(this.data);
    this.emailUtilityContext.setUtilitySummaryDetails = this.setUtilitySummaryDetails.bind(this);
    this.getMetadata();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private async initializeUtilities(): Promise<void> {
    // Initialize utilities here
    await this.getMetadata();
  }

  private setUtilitySummaryDetails(widget: any): void {
    this.getUtilitiesCount(widget);
  }

  handleCancel() {}

  private async getUtilitiesCount(widgetItem: any): Promise<void> {
    if (!widgetItem) return;

    const widgetsDetailsResponse = await this.utilityService.getWidgetsDetails(this.widgets, this.CaseID);
    const widgetsDetails = widgetsDetailsResponse.widgets;
    const tempUtilitiesSummaries: { iconName: string; count: number; name: string }[] = [];
    widgetsDetails.forEach(widgetDetails => {
      const widgetName = widgetDetails.name;
      const widgetCount = widgetDetails.itemCount;
      this.utilities.forEach(utility => {
        const UtilityComponentName = utility.props.getPConnect().getComponentName();
        const { label } = utility.props.this.getPConnect().getConfigProps();

        if (UtilityComponentName.toUpperCase() === widgetName) {
          tempUtilitiesSummaries.push({
            iconName: this.utilitySummaryIconMapping[UtilityComponentName].iconName,
            count: widgetCount === undefined ? 0 : widgetCount,
            name: this.utilitySummaryIconMapping[UtilityComponentName].label
          });
        }
      });
    });
    this.utilitiesSummaries = tempUtilitiesSummaries;
  }

  getMetadata = async () => {
    this.attachmentsList = [];
    this.preExistingAttachments = [];
    const payload = {
      ActionType: this.data.ActionType,
      CaseID: this.data.CaseID,
      Context: this.data.context,
      TemplateID: this.TemplateID,
      Draft: this.hasSavedDraft,
      WrapperCaseID: this.getWrapperCaseID()
    };

    this.updateProgressState(this.loadingText, true);
    const { data } = await PCore.getDataApiUtils().getData('D_pxEmailComposerMetadata', {
      dataViewParameters: payload as any
    });

    const metaData = data.data[0];
    const toRecipientItems = metaData.pyToRecipientList?.map(recipient => recipient.pyEmailAddress) || [];
    const ccRecipientItems = metaData.pyCCRecipientList?.map(recipient => recipient.pyEmailAddress) || [];
    const bccRecipientItems = metaData.pyBCCRecipientList?.map(recipient => recipient.pyEmailAddress) || [];
    const fromRecipientItems = metaData.pyFromRecipientList?.map(recipient => recipient.pyEmailRecipientName) || [];
    const replyTemplateItems = this.Replies.map(replyTemplate => ({
      title: replyTemplate.current ? replyTemplate.current[0].pyName : replyTemplate.title,
      id: replyTemplate.current ? replyTemplate.current[0].pyTemplateInsId : replyTemplate.id,
      templates: replyTemplate.templates
    }));

    // const preExistingAttachmentsList =
    //   metaData.pyAttachments?.map(attachment => ({
    //     visual: { icon: 'document-doc' },
    //     primary: { name: attachment.fileName },
    //     secondary: { text: '' },
    //     // name: attachment.fileName,
    //     id: attachment.ID,
    //     // type: attachment.extension,
    //     isExisting: true
    //     // onPreview: this.handlePreviewClick(attachment.ID)
    //   })) || [];

    const preExistingAttachmentsList =
      this.emailService.prepareInputForAttachment(metaData.pyAttachments)?.map(attachment => ({
        ...attachment,
        isExisting: true
      })) || [];
    this.previewAttachments = preExistingAttachmentsList;
    this.preExistingAttachments = preExistingAttachmentsList;
    // need to update this logic
    this.attachmentsList = preExistingAttachmentsList.concat(this.composerState.attachments || []);

    const bodyContent = this.body ? `${this.body}${this.getReplyOrForwardContent(metaData)}` : this.getBodyContent(metaData);

    this.composerData = {
      to: { value: toRecipientItems },
      cc: { value: this.data.ActionType === 'REPLYALL' || this.hasSavedDraft ? ccRecipientItems : [] },
      bcc: { value: this.data.ActionType === 'REPLYALL' || this.hasSavedDraft ? bccRecipientItems : [] },
      subject: { value: this.data.ActionType === 'FORWARD' ? `Fw: ${metaData.pySubject}` : metaData.pySubject },
      bodyContent: {
        defaultValue: bodyContent,
        forwardedContent: updateImageSrcsWithAbsoluteURLs(metaData.pyForwardedContent, this.data.pConn),
        repliedContent: metaData.pyRepliedContent
      },
      selectedTemplateId: this.TemplateID || metaData.pySelectedReplyTemplate || '',
      attachments: this.attachmentsList as any,
      responseType: this.data.ActionType === 'REPLYALL' ? 'replyAll' : this.data.ActionType.toLowerCase()
    };

    console.log(this.composerData);

    this.ccEmailUsers = ccRecipientItems;
    this.bccEmailUsers = bccRecipientItems;
    this.fromRecipients = fromRecipientItems;
    this.replyTemplates = replyTemplateItems;
    this.participants = toRecipientItems
      .concat(ccRecipientItems)
      .concat(bccRecipientItems)
      .map(email => ({ EmailAddress: email }));

    this.updateProgressState('', false);
    this.composerHandle?.replaceBodyContent(bodyContent);
    this.initialLoad = true;
    this.composerHandle?.setCursorLocationToStart?.();

    if (this.preLoadArticleData && Object.keys(this.preLoadArticleData).length > 0) {
      this.articleData = this.preLoadArticleData.articleData;
      this.source = this.preLoadArticleData.source;
      this.isShareArticleNotificationReceived = true;
      this.preLoadArticleData = {};
    }
  };

  getBodyContent(metaData: any): string {
    // Implement the logic to return a string
    return '';
  }

  getReplyOrForwardContent(metaData: any): string {
    // Implement the logic to return a string
    return '';
  }

  private getWrapperCaseID(): string {
    if (!this.isCaseInSharedContext()) {
      const primaryContainer = PCore.getContainerUtils().getActiveContainerItemContext('app/primary');
      return PCore.getStoreValue('.caseInfo.ID', '', primaryContainer as any);
    }
    return '';
  }

  getCreateCaseContext = () => {
    if (this.isEmailClientRef) {
      return PCore.getContainerUtils().getActiveContainerItemContext('app/modal');
    }
    const activeContainer = PCore.getContainerUtils().getActiveContainerItemContext('app/primary');
    return PCore.getContainerUtils().getActiveContainerItemContext(`${activeContainer}/workarea`);
  };

  isCaseInSharedContext() {
    // throw new Error('Method not implemented.');
    return false;
  }

  updateProgressState(message: string, showLoading: boolean): void {
    this.loadingText = message;
    this.isProgress = showLoading;
  }

  private handlePreviewClick(id: string): () => void {
    return () => {
      if (!this.hasSavedDraft) {
        this.previewAttachId = id;
        this.openLightBox = true;
      }
    };
  }

  private async sendEmailAPICall(
    sendEmailPayload: {
      Attachments?: { type: string; category: string; name: any; ID: any }[];
      [key: string]: any;
    } & { Attachments: { type: string; category: string; name: any; ID: any }[] }
  ): Promise<void> {
    if (this.isDraftSaved) {
      const { data } = await PCore.getRestClient().invokeRestApi('saveTriageEmailDraft', {
        body: sendEmailPayload
      });
      if (data.Status === 'success') {
        this.emailContentChanged = false;
        this.draftWindow?.dismiss();
        this.closeComposer(true);
        this.setIsActive(false);
        (PCore as any).getToaster().push({ content: this.data.pConn.getLocalizedValue('Draft saved') });
      } else {
        (({ PCore }) as any).getToaster().push({ content: this.data.pConn.getLocalizedValue('Error in saving draft') });
      }
    } else {
      this.updateProgressState(this.data.pConn.getLocalizedValue('Sending email'), true);
      const { data } = await (PCore as any).getRestClient().invokeRestApi('sendTriageEmail', {
        body: sendEmailPayload
      });
      this.updateProgressState('', false);
      if (data.Status === 'success') {
        this.emailContentChanged = false;
        this.closeComposer(true);
        this.setIsActive(false);
        this.updateProgressState('', false);
      }
    }
  }

  async sendEmail(): Promise<void> {
    let hasError = false;
    let data = { ...this.composerData };
    if (this.doImplicitDraftSave) {
      data = this.composerStateForDraft;
    }
    hasError = this.validateInputs(data, hasError);

    if (this.composerData.attachments) {
      data.attachments
        .filter(attachment => this.filterLargeAttachment(attachment))
        .forEach((file: any) => {
          file.error = this.largeAttachmentError();
          hasError = true;
          file.onCancel = (id: string) => {
            this.OnCancelOfAttachment(id);
          };
        });
    }
    if (hasError) {
      this.updateProgressState('', false);
      this.composerData = data;
      return;
    }
    const payloadPreExistAttachments = [];
    const attachmentsToUpload = [];
    this.setAttachmentsToUpload(this.attachmentsList, attachmentsToUpload, this.preExistingAttachments, payloadPreExistAttachments);
    const templateID = this.isDraftSaved ? data.selectedTemplateId : this.TemplateID;

    const sendEmailPayload = this.getSendEmailPayload(data, payloadPreExistAttachments, templateID);

    const attachmentIDs: { type: string; category: string; name: any; ID: any }[] = [];
    const attachmentUtils = window.PCore.getAttachmentUtils();
    this.updateProgressState(this.data.pConn.getLocalizedValue('Sending email'), true);
    if (attachmentsToUpload && attachmentsToUpload.length > 0) {
      attachmentsToUpload
        .filter((file: any) => !file.error)
        .forEach((file: any) => {
          attachmentUtils
            .uploadAttachment(file, this.onUploadProgress, this.errorHandler, this.data.pConn.getContextName())
            .then(async (fileResponse: any) => {
              const fileConfig = {
                type: 'File',
                category: 'File',
                name: file.name,
                ID: fileResponse?.ID
              };
              attachmentIDs.push(fileConfig);
              if (attachmentIDs.length === attachmentsToUpload.length) {
                (sendEmailPayload as any).Attachments = attachmentIDs;
                this.sendEmailAPICall(sendEmailPayload as any);
              }
            })
            .catch(console.error);
        });
    } else {
      this.sendEmailAPICall(sendEmailPayload as any);
    }
  }

  validateInputs(
    data: {
      to: { value: never[] };
      cc: { value: never[] };
      bcc: { value: never[] };
      subject: { value: string };
      bodyContent: { defaultValue: string; forwardedContent: string; repliedContent: string };
      selectedTemplateId: string;
      attachments: never[];
      responseType: string;
    },
    hasError: boolean
  ): boolean {
    throw new Error('Method not implemented.');
  }

  filterLargeAttachment(attachment: never): unknown {
    throw new Error('Method not implemented.');
  }

  largeAttachmentError(): any {
    throw new Error('Method not implemented.');
  }

  OnCancelOfAttachment(id: string) {
    throw new Error('Method not implemented.');
  }

  setAttachmentsToUpload(attachmentsList: any[], attachmentsToUpload: never[], preExistingAttachments: any[], payloadPreExistAttachments: never[]) {
    throw new Error('Method not implemented.');
  }

  getSendEmailPayload(
    data: {
      to: { value: never[] };
      cc: { value: never[] };
      bcc: { value: never[] };
      subject: { value: string };
      bodyContent: { defaultValue: string; forwardedContent: string; repliedContent: string };
      selectedTemplateId: string;
      attachments: never[];
      responseType: string;
    },
    payloadPreExistAttachments: never[],
    templateID: string
  ) {
    throw new Error('Method not implemented.');
  }

  onUploadProgress(file: never, onUploadProgress: any, errorHandler: any, arg3: any) {
    throw new Error('Method not implemented.');
  }

  errorHandler(file: never, onUploadProgress: any, errorHandler: any, arg3: any) {
    throw new Error('Method not implemented.');
  }

  saveDraft(): void {
    this.updateProgressState(this.data.pConn.getLocalizedValue('Saving draft'), true);
    this.isDraftSaved = true;
    this.sendEmail();
  }

  private discardComposerChanges(): void {
    this.emailContentChanged = false;
    this.closeComposer(true);
    this.setIsActive(false);
    this.draftWindow?.dismiss();
    this.setIsActive(false);
  }

  private async deleteDraft(): Promise<void> {
    this.updateProgressState(this.data.pConn.getLocalizedValue('Deleting draft'), true);
    if (this.hasSavedDraft) {
      const { data } = await (PCore as any).getRestClient().invokeRestApi('deleteTriageEmailDraft', {
        queryPayload: { caseID: this.CaseID, contextID: this.data.context }
      });
      if (data.Status === 'success') {
        this.closeComposer(true);
        this.setIsActive(false);
        (PCore as any).getToaster().push({ content: this.data.pConn.getLocalizedValue('Draft deleted') });
      }
    }
    this.updateProgressState('', false);
    this.draftWindow?.dismiss();
    this.setIsActive(false);
  }

  private closeComposer(getUpdatedData: boolean = false): void {
    (PCore as any).getPubSubUtils().publish('CLOSE_COMPOSER', { Context: this.data.context, getUpdatedData });
    if (this.doImplicitDraftSave) {
      const draftAndUndeliveredStatus = {
        hasDraft: true,
        assignID: this.assignID
      };
      (PCore as any).getPubSubUtils().publish('UPDATE_CASE_IN_LIST', draftAndUndeliveredStatus);
      this.doImplicitDraftSave = false;
    }
  }

  private async rephraseBody(): Promise<void> {
    if (this.composerData.bodyContent.defaultValue) {
      if (!this.rephrasedBody) {
        (PCore as any).getToaster().push({ content: this.data.pConn.getLocalizedValue('Error while rephrasing email using AI.') });
        this.errorWithGenAI = true;
        this.toneAnalysisWindow?.dismiss();
      } else if (this.rephrasedBody) {
        this.Isrephrased = true;
        this.composerHandle?.replaceBodyContent(`${this.rephrasedBody ? this.rephrasedBody : ''}`);
      }
      this.toneAnalysisWindow?.dismiss();
    }
  }

  async toneAnalysisWithGenAI(): Promise<void> {
    await this.checkToneIsPoliteOrNot();
    if (!this.isPoliteTone) {
      if (this.composerData.bodyContent.defaultValue) {
        this.toneAnalysisWindow = (PCore as any).getModalManager().create(this.toneAnalysisModal, {
          heading: this.toneModalHeading,
          actions: this.ToneActions,
          content: this.data.pConn.getLocalizedValue('The email is poorly formatted and not appropriate for customer interaction')
        });
      }
    } else {
      this.sendEmail();
    }
  }

  toneAnalysisModal(toneAnalysisModal: any, arg1: { heading: string; actions: any; content: any }): any {
    throw new Error('Method not implemented.');
  }

  private async checkToneIsPoliteOrNot(): Promise<void> {
    const forwardedContentDivId = `#FORWARDED_CONTENT_DIV`;
    const repliedContentDivId = `#REPLIED_CONTENT_DIV`;
    const emailContentElement = document.createElement('div');
    emailContentElement.innerHTML = this.composerData.bodyContent.defaultValue;
    const forwardDiv = emailContentElement.querySelector(forwardedContentDivId);
    const repliedDiv = emailContentElement.querySelector(repliedContentDivId);
    if (this.composerData.bodyContent.defaultValue) {
      const message = this.removeAdditionalContent(this.composerData.bodyContent.defaultValue);
      const parser = new DOMParser();
      const currentMessage = parser.parseFromString(message as any, 'text/html');
      if (currentMessage.body.innerText.trim()) {
        const payload1 = {
          Message: message,
          EmailAddress: this.composerData.to.value.length > 0 ? this.composerData.to.value[0] : ''
        };
        this.updateProgressState(this.data.pConn.getLocalizedValue('Reviewing response'), true);
        const { data } = await (PCore as any).getDataApiUtils().getData('D_pxEmailToneAnalysis', {
          dataViewParameters: payload1
        });
        this.updateProgressState('', false);
        if (data.data?.length) {
          const poilteTone = data.data[0].pxIsPoliteTone;
          let genAIResponse = data.data[0].pxRephrasedMessage;
          if (poilteTone === null || genAIResponse === null || poilteTone === true) {
            this.isPoliteTone = true;
          } else if (typeof poilteTone === 'string') {
            this.isPoliteTone = poilteTone.toLowerCase() === 'true';
          } else if (typeof poilteTone === 'boolean') {
            this.isPoliteTone = poilteTone;
          }
          if (genAIResponse) {
            genAIResponse = genAIResponse.trimStart();
            genAIResponse = genAIResponse.trimEnd();
            this.rephrasedBody = genAIResponse.replace(/(?:\r\n|\r|\n)/g, '<br>');
            if (forwardDiv !== null) {
              this.rephrasedBody += forwardDiv.outerHTML.toString();
            } else if (repliedDiv !== null) {
              this.rephrasedBody += repliedDiv.outerHTML.toString();
            }
          }
        }
      }
    }
  }

  removeAdditionalContent(defaultValue: string) {
    throw new Error('Method not implemented.');
  }

  handleOnChange(field: any, value: any): void {
    if (this.initialLoad) this.emailContentChanged = true;
    const hasStateChanged = false;
    this.composerData = { ...this.composerData };
    this.handleComposerOnChange(this.composerData, field, ''); // value);
    if (field === 'bodyContent') {
      const parser = new DOMParser();
      const currentMessage = parser.parseFromString('', 'text/html');
      const rephrasedMessage = parser.parseFromString(this.rephrasedBody, 'text/html');
      if (rephrasedMessage.body.innerText.replaceAll('\n', '').trim() !== currentMessage.body.innerText.replaceAll('\n', '').trim()) {
        this.Isrephrased = false;
      }
    }

    if (field === 'responseType') {
      this.composerData.responseType = value;
      this.data.ActionType = value.toUpperCase();
      this.getMetadata();
    }

    if (field === 'bodyContent') {
      const parser = new DOMParser();
    }
  }

  handleComposerOnChange(data: any, field: string, value: any): void {
    switch (field) {
      case 'to':
        data.to.value = value;
        break;
      case 'cc':
        data.cc.value = value;
        break;
      case 'bcc':
        data.bcc.value = value;
        break;
      case 'subject':
        data.subject.value = value;
        break;
      case 'bodyContent':
        data.bodyContent.defaultValue = value;
        break;
      case 'selectedTemplateId':
        data.selectedTemplateId = value;
        break;
      case 'attachments':
        data.attachments = value;
        break;
      default:
        break;
    }
    this.composerData = data;
  }
}
