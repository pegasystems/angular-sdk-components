import { Component, OnInit, Input, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';
import {
  clearFieldErrorMessages,
  deleteAttachments,
  getMappedValue,
  insertAttachments,
  onFileDownload,
  transformAttachments,
  validateFileExtension,
  validateMaxSize
} from './AttachmentUtils';
import { PageInstructionOptions } from './Attachment.types';

interface AttachmentProps extends Omit<PConnFieldProps, 'value'> {
  // If any, enter additional props that only exist on this component
  value: any;
  extensions: any;
  allowMultiple: boolean;
  isTableFormatter: boolean;
  editMode: string;
}

@Component({
  selector: 'app-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss'],
  imports: [CommonModule, MatProgressSpinnerModule, MatMenuModule, MatIconModule, MatButtonModule]
})
export class AttachmentComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  // For interaction with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  @ViewChild('uploader', { static: false }) fileInput: ElementRef;

  localizationService: any;
  contextName: string;
  actionSequencer: any;
  caseID: any;
  label$ = '';
  value$: any;
  bRequired$ = false;
  bReadonly$ = false;
  bDisabled$ = false;
  bVisible$ = true;
  allowMultiple$ = false;
  extensions$ = '';
  displayMode: string | undefined;
  status = '';
  validateMessage: string | undefined = '';
  valueRef: string;
  localizedVal = PCore.getLocaleUtils().getLocaleValue;
  uploadMultipleFilesLabel = this.localizedVal('file_upload_text_multiple', 'CosmosFields');
  uploadSingleFileLabel = this.localizedVal('file_upload_text_one', 'CosmosFields');
  filesWithError: any = [];
  files: any = [];
  srcImg: any;
  deleteIcon: string;
  tempFilesToBeUploaded: any[];
  attachments: any;
  attachmentCount: number = 0;
  isOldAttachment = false;
  multiAttachmentsInInlineEdit: any = [];
  isMultiAttachmentInInlineEditTable;
  overrideLocalState = false;

  constructor(
    private angularPConnect: AngularPConnectService,
    private utils: Utils
  ) {}

  ngOnInit(): void {
    this.srcImg = this.utils.getImageSrc('document-doc', this.utils.getSDKStaticContentUrl());
    this.deleteIcon = this.utils.getImageSrc('trash', this.utils.getSDKStaticContentUrl());

    this.localizationService = this.pConn$.getLocalizationService();
    this.contextName = this.pConn$.getContextName();
    this.actionSequencer = PCore.getActionsSequencer();

    this.caseID = PCore.getStoreValue(`.${getMappedValue('pyID')}`, PCore.getResolvedConstantValue('caseInfo.content'), this.contextName);

    this.displayMode = this.pConn$.getConfigProps().displayMode;

    if (this.displayMode !== 'DISPLAY_ONLY') {
      PCore.getPubSubUtils().subscribe(
        PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.ASSIGNMENT_SUBMISSION,
        () => {
          this.overrideLocalState = true;
        },
        this.caseID
      );
    }

    const { value } = this.pConn$.getConfigProps();
    const rawValue = this.pConn$.getComponentConfig().value;
    const isAttachmentAnnotationPresent = typeof rawValue === 'object' ? false : rawValue?.includes('@ATTACHMENT');
    const { attachments, isOldAttachment } = isAttachmentAnnotationPresent ? value : PCore.getAttachmentUtils().prepareAttachmentData(value);
    this.isOldAttachment = isOldAttachment;
    this.attachments = attachments;
    this.files = transformAttachments(attachments);

    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.checkAndUpdate();
  }

  checkAndUpdate() {
    // Should always check the bridge to see if the component should
    // update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // ONLY call updateSelf when the component should update
    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  // Callback passed when subscribing to store change
  onStateChange() {
    this.checkAndUpdate();
  }

  updateSelf() {
    const configProps: AttachmentProps = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as AttachmentProps;
    const stateProps = this.pConn$.getStateProps();
    const { value, label, required, visibility, disabled, readOnly, extensions, displayMode, isTableFormatter, allowMultiple, editMode } =
      configProps;

    this.bRequired$ = this.utils.getBooleanValue(required);
    this.bVisible$ = this.utils.getBooleanValue(visibility);
    this.bDisabled$ = this.utils.getBooleanValue(disabled);
    this.bReadonly$ = this.utils.getBooleanValue(readOnly);
    this.allowMultiple$ = this.utils.getBooleanValue(allowMultiple);

    this.label$ = label;
    this.value$ = value;
    this.status = stateProps.status;

    this.validateMessage = this.angularPConnectData.validateMessage;
    this.extensions$ = extensions;
    this.valueRef = this.pConn$.getStateProps().value;
    this.valueRef = this.valueRef.startsWith('.') ? this.valueRef.substring(1) : this.valueRef;

    this.pConn$.setReferenceList(`.${this.valueRef}`);

    this.displayMode = displayMode;
    this.isMultiAttachmentInInlineEditTable = isTableFormatter && allowMultiple && editMode === 'tableRows';

    // update the attachments shown in the UI
    this.updateAttachments();
  }

  updateAttachments() {
    if (this.overrideLocalState) {
      const serverFiles = transformAttachments(this.attachments);
      this.overrideLocalState = false;
      this.attachmentCount = this.attachments.length;
      this.filesWithError = [];
      this.files = serverFiles;
    } else {
      // Determine whether refresh call has overridden any error files in redux, push error files back to redux from local state to perform client side validation during assignment submit
      const errorFiles = this.attachments.filter(attachment => attachment.props.error);
      if (errorFiles.length === 0 && this.filesWithError.length > 0) {
        // Check if local file state contains error files and push those to redux
        const uniqueKey = getMappedValue('pzInsKey');
        const transformedErrorFiles = this.filesWithError.map(errorFile => {
          const filename = errorFile.props.name;
          return {
            [uniqueKey]: errorFile.props.id,
            FileName: filename,
            Category: '',
            FileExtension: filename.split('.').pop() ?? filename,
            error: errorFile.props.error || null
          };
        });
        let key = '';
        let updatedAttachments: any = [];
        if (this.allowMultiple$ || this.isOldAttachment) {
          key = this.isOldAttachment ? `${this.valueRef}.pxResults` : this.valueRef;
          const existingAttachments = PCore.getStoreValue(`.${key}`, this.pConn$.getPageReference(), this.pConn$.getContextName()) || [];
          updatedAttachments = [...existingAttachments, ...transformedErrorFiles];
        } else {
          key = this.valueRef;
          updatedAttachments = transformedErrorFiles[0];
        }
        PCore.getStateUtils().updateState(this.pConn$.getContextName(), key, updatedAttachments, {
          pageReference: this.pConn$.getPageReference(),
          isArrayDeepMerge: false,
          removePropertyFromChangedList: true
        });
      }
    }
  }

  downloadFile(fileObj: any) {
    onFileDownload(fileObj, this.contextName);
  }

  deleteFile(file, fileIndex: number) {
    if (this.filesWithError.length > 0) {
      this.filesWithError = this.filesWithError.filter(fileWithError => fileWithError.props.id !== file.props.id);
      if (this.filesWithError.length === 0) {
        clearFieldErrorMessages(this.pConn$);
      }
    }

    if (file.inProgress) {
      // @ts-ignore - Expected 1 arguments, but got 2.ts(2554)
      PCore.getAttachmentUtils().cancelRequest(file.props.id, this.contextName);
      this.actionSequencer.deRegisterBlockingAction(this.contextName).catch(() => {});
      this.files = this.files.filter(localFile => localFile.props.id !== file.props.id);
    } else {
      deleteAttachments([file], this.pConn$, this.multiAttachmentsInInlineEdit, {
        allowMultiple: this.allowMultiple$,
        isOldAttachment: this.isOldAttachment,
        isMultiAttachmentInInlineEditTable: this.isMultiAttachmentInInlineEditTable,
        attachmentCount: this.attachmentCount,
        deleteIndex: fileIndex
      } as any);

      // Filter out without deleted file and reset the file indexes
      let tempLocalFiles = [...this.files];
      tempLocalFiles = tempLocalFiles.filter(localFile => localFile.props.id !== file.props.id);
      tempLocalFiles.forEach(localFile => {
        if (!localFile.props.error && !file.props.error) {
          const updatedDeleteIndex =
            localFile.responseProps.deleteIndex > fileIndex ? localFile.responseProps.deleteIndex - 1 : localFile.responseProps.deleteIndex;

          localFile.responseProps.deleteIndex = updatedDeleteIndex;
        }
      });
      this.files = tempLocalFiles;
      if (!file.props.error) {
        this.attachmentCount -= 1;
      }
    }

    this.fileInput.nativeElement.value = '';
  }

  onFileAdded(event) {
    let addedFiles = Array.from(event.target.files);
    addedFiles = this.allowMultiple$ ? addedFiles : [addedFiles[0]];
    const maxAttachmentSize = PCore.getEnvironmentInfo().getMaxAttachmentSize() || '5';
    this.tempFilesToBeUploaded = [
      ...addedFiles.map((f: any, index) => {
        f.ID = `${new Date().getTime()}I${index}`;
        f.props = {
          type: f.type,
          name: f.name,
          id: f.ID,
          format: f.name.split('.').pop(),
          icon: this.utils.getIconFromFileType(f.type),
          thumbnail: window.URL.createObjectURL(f)
        };

        if (!validateMaxSize(f, maxAttachmentSize)) {
          f.props.error = true;
          f.props.meta = this.localizationService.getLocalizedText(`File is too big. Max allowed size is ${maxAttachmentSize}MB.`);
        } else if (!validateFileExtension(f, this.extensions$)) {
          f.props.error = true;
          f.props.meta = `${this.localizationService.getLocalizedText('File has invalid extension. Allowed extensions are:')} ${this.extensions$.replaceAll(
            '.',
            ''
          )}`;
        }

        if (f.props.error) {
          const fieldName = (this.pConn$.getStateProps() as any).value;
          PCore.getMessageManager().addMessages({
            messages: [
              {
                type: 'error',
                message: this.localizationService.getLocalizedText('Error with one or more files')
              }
            ],
            property: fieldName,
            pageReference: this.pConn$.getPageReference(),
            context: this.contextName
          });
        }
        return f;
      })
    ];

    const tempFilesWithError = this.tempFilesToBeUploaded.filter(f => f.props.error);
    if (tempFilesWithError.length > 0) {
      this.filesWithError = [...this.filesWithError, ...tempFilesWithError];

      insertAttachments(tempFilesWithError, this.pConn$, this.multiAttachmentsInInlineEdit, {
        allowMultiple: this.allowMultiple$,
        isOldAttachment: this.isOldAttachment,
        isMultiAttachmentInInlineEditTable: this.isMultiAttachmentInInlineEditTable,
        attachmentCount: this.attachmentCount
      } as PageInstructionOptions);
    }

    if (!this.allowMultiple$) {
      this.files = [...this.tempFilesToBeUploaded];
    } else {
      this.files = [...this.files, ...this.tempFilesToBeUploaded];
    }

    this.actionSequencer.registerBlockingAction(this.contextName).then(() => {
      this.uploadFiles();
    });
  }

  onUploadProgress(id, ev) {
    const progress = Math.floor((ev.loaded / ev.total) * 100);
    this.files = this.files.map(localFile => {
      if (localFile.props?.id === id) {
        localFile.inProgress = true;
        localFile.props.progress = progress;
      }
      return localFile;
    });
  }

  populateErrorAndUpdateRedux(file) {
    const fieldName = (this.pConn$.getStateProps() as any).value;
    // set errors to property to block submit even on errors in file upload
    PCore.getMessageManager().addMessages({
      messages: [
        {
          type: 'error',
          message: this.localizationService.getLocalizedText('Error with one or more files')
        }
      ],
      property: fieldName,
      pageReference: this.pConn$.getPageReference(),
      context: this.contextName
    });
    insertAttachments([file], this.pConn$, this.multiAttachmentsInInlineEdit, {
      allowMultiple: this.allowMultiple$,
      isOldAttachment: this.isOldAttachment,
      isMultiAttachmentInInlineEditTable: this.isMultiAttachmentInInlineEditTable,
      attachmentCount: this.attachmentCount
    } as any);
  }

  errorHandler(isFetchCanceled, file) {
    return error => {
      if (!isFetchCanceled(error)) {
        let uploadFailMsg = this.localizationService.getLocalizedText('Something went wrong');
        if (error.response && error.response.data && error.response.data.errorDetails) {
          uploadFailMsg = this.localizationService.getLocalizedText(error.response.data.errorDetails[0].localizedValue);
        }

        this.files = this.files.map(localFile => {
          if (localFile.props.id === file.props.id) {
            localFile.props.meta = uploadFailMsg;
            localFile.props.error = true;
            localFile.props.icon = this.utils.getIconFromFileType(localFile.type);
            localFile.props.name = this.localizationService.getLocalizedText('Unable to upload file');
            localFile.inProgress = false;
            delete localFile.props.progress;
            this.filesWithError.push(localFile);

            this.populateErrorAndUpdateRedux(localFile);
          }
          return localFile;
        });
      }
      throw error;
    };
  }

  uploadFiles() {
    const filesToBeUploaded = this.files
      .filter(e => {
        const isFileUploaded = e.props && e.props.progress === 100;
        const fileHasError = e.props && e.props.error;
        const isFileUploadedInLastStep = e.responseProps && e.responseProps.ID !== 'temp';
        const isFileUploadInProgress = e.inProgress;
        return !isFileUploadInProgress && !isFileUploaded && !fileHasError && !isFileUploadedInLastStep;
      })
      .map(file =>
        PCore.getAttachmentUtils().uploadAttachment(
          file,
          ev => {
            this.onUploadProgress(file.props.id, ev);
          },
          isFetchCanceled => {
            return this.errorHandler(isFetchCanceled, file);
          },
          this.contextName
        )
      );

    Promise.allSettled(filesToBeUploaded)
      .then((fileResponses: any) => {
        fileResponses = fileResponses.filter(fr => fr.status !== 'rejected'); // in case of deleting an in progress file, promise gets cancelled but still enters then block
        if (fileResponses.length > 0) {
          this.files = this.files.map(localFile => {
            // if attach field has multiple files & in bw any error files are present
            // Example : files = [properFile1, errFile, errFile, properFile2]
            // indexes for delete & preview should be for files [properFile1, properFile2] which is [1,2]
            const index = fileResponses.findIndex(fileResponse => fileResponse.value.clientFileID === localFile.props.id);
            if (index >= 0) {
              fileResponses[index].value.thumbnail = localFile.props.thumbnail;
              localFile.inProgress = false;
              localFile.ID = fileResponses[index].value.ID;
              localFile.props.meta = this.localizationService.getLocalizedText('Uploaded successfully');
              localFile.props.progress = 100;
              localFile.handle = fileResponses[index].value.ID;
              localFile.label = this.valueRef;
              localFile.responseProps = {
                pzInsKey: 'temp',
                pyAttachName: localFile.props.name
              };
            }

            return localFile;
          });

          insertAttachments(fileResponses, this.pConn$, this.multiAttachmentsInInlineEdit, {
            allowMultiple: this.allowMultiple$,
            isOldAttachment: this.isOldAttachment,
            isMultiAttachmentInInlineEditTable: this.isMultiAttachmentInInlineEditTable,
            attachmentCount: this.attachmentCount,
            insert: true
          } as any);

          this.attachmentCount += fileResponses.length;

          if (this.filesWithError?.length === 0) {
            clearFieldErrorMessages(this.pConn$);
          }

          this.actionSequencer.deRegisterBlockingAction(this.contextName).catch(() => {});
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }

    if (this.displayMode !== 'DISPLAY_ONLY') {
      PCore.getPubSubUtils().unsubscribe(PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.ASSIGNMENT_SUBMISSION, this.caseID);
    }
  }
}
