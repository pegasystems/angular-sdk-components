import { Component, OnInit, Input, NgZone, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import download from 'downloadjs';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface AttachmentProps extends Omit<PConnFieldProps, 'value'> {
  // If any, enter additional props that only exist on this component
  value: any;
  extensions: any;
  allowMultiple: boolean;
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

  label$ = '';
  value$: any;
  bRequired$ = false;
  bReadonly$ = false;
  bDisabled$ = false;
  bVisible$ = true;
  bLoading$ = false;
  bShowSelector$ = true;
  att_categoryName: string;
  fileTemp: any = {};
  caseID: any;
  allowMultiple$ = false;
  extensions$ = '';
  status = '';
  validateMessage: string | undefined = '';
  valueRef: string;
  imagePath$: string;
  localizedVal = PCore.getLocaleUtils().getLocaleValue;
  localeCategory = 'CosmosFields';
  uploadMultipleFilesLabel = this.localizedVal('file_upload_text_multiple', this.localeCategory);
  uploadSingleFileLabel = this.localizedVal('file_upload_text_one', this.localeCategory);
  filesWithError: any = [];
  files: any = [];
  categoryName: string;
  displayMode: string | undefined;
  srcImg: any;
  deleteIcon: string;
  tempFilesToBeUploaded: any[];
  constructor(
    private angularPConnect: AngularPConnectService,
    private utils: Utils,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.caseID = PCore.getStoreValue('.pyID', 'caseInfo.content', this.pConn$.getContextName());
    this.srcImg = this.utils.getImageSrc('document-doc', this.utils.getSDKStaticContentUrl());
    this.deleteIcon = this.utils.getImageSrc('trash', this.utils.getSDKStaticContentUrl());
    this.checkAndUpdate();
    this.getAttachments();
  }

  getAttachments() {
    let tempUploadedFiles = this.getCurrentAttachmentsList(this.getAttachmentKey(this.valueRef), this.pConn$.getContextName());
    tempUploadedFiles = tempUploadedFiles.filter(f => f.label === this.valueRef && f.delete !== true);
    this.files?.map(f => {
      return f.responseProps?.pzInsKey && !f.responseProps.pzInsKey.includes('temp')
        ? {
            ...f,
            props: {
              ...f.props,
              onDelete: () => this.deleteFile(f)
            }
          }
        : { ...f };
    });
    this.files = [...this.files, ...tempUploadedFiles];
    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.ASSIGNMENT_SUBMISSION,
      this.resetAttachmentStoredState.bind(this),
      this.caseID
    );
    return () => {
      PCore.getPubSubUtils().unsubscribe(PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.ASSIGNMENT_SUBMISSION, this.caseID);
    };
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
    const { value, label, extensions, displayMode } = configProps;

    if (configProps.required != null) {
      this.bRequired$ = this.utils.getBooleanValue(configProps.required);
    }
    if (configProps.visibility != null) {
      this.bVisible$ = this.utils.getBooleanValue(configProps.visibility);
    }

    // disabled
    if (configProps.disabled != undefined) {
      this.bDisabled$ = this.utils.getBooleanValue(configProps.disabled);
    }

    if (configProps.readOnly != null) {
      this.bReadonly$ = this.utils.getBooleanValue(configProps.readOnly);
    }

    if (configProps.allowMultiple != null) {
      this.allowMultiple$ = this.utils.getBooleanValue(configProps.allowMultiple);
    }

    this.label$ = label;
    this.value$ = value;
    this.status = stateProps.status;

    this.validateMessage = this.angularPConnectData.validateMessage;
    this.extensions$ = extensions;
    this.valueRef = this.pConn$.getStateProps().value;
    this.valueRef = this.valueRef.startsWith('.') ? this.valueRef.substring(1) : this.valueRef;
    this.displayMode = displayMode;
    /* this is a temporary fix because required is supposed to be passed as a boolean and NOT as a string */
    let { required, disabled } = configProps;
    [required, disabled] = [required, disabled].map(prop => prop === true || (typeof prop === 'string' && prop === 'true'));

    this.categoryName = '';
    if (value && value.pyCategoryName) {
      this.categoryName = value.pyCategoryName;
    }

    if (value?.pxResults && +value.pyCount > 0) {
      this.files = value.pxResults.map(f => this.buildFilePropsFromResponse(f));
    }

    this.updateAttachments();
  }

  buildFilePropsFromResponse(respObj) {
    return {
      props: {
        meta: `${respObj.pyCategoryName}, ${respObj.pxCreateOperator}`,
        name: respObj.pyAttachName,
        icon: this.utils.getIconFromFileType(respObj.pyMimeFileExtension)
      },
      responseProps: {
        ...respObj
      }
    };
  }

  updateAttachments() {
    if (this.files.length > 0 && this.displayMode !== 'DISPLAY_ONLY') {
      const currentAttachmentList = this.getCurrentAttachmentsList(this.getAttachmentKey(this.valueRef), this.pConn$.getContextName());
      // block duplicate files to redux store when added 1 after another to prevent multiple duplicates being added to the case on submit
      const tempFiles = this.files.filter(f => currentAttachmentList.findIndex(fr => fr.ID === f.ID) === -1 && !f.inProgress && f.responseProps);
      const updatedAttList = [...currentAttachmentList, ...tempFiles];
      this.updateAttachmentState(this.pConn$, this.getAttachmentKey(this.valueRef), updatedAttList);
    }
  }

  resetAttachmentStoredState() {
    PCore.getStateUtils().updateState(this.pConn$?.getContextName(), this.getAttachmentKey(this.valueRef), undefined, {
      pageReference: 'context_data',
      isArrayDeepMerge: false
    });
  }

  downloadFile(fileObj: any) {
    PCore.getAttachmentUtils()
      // @ts-ignore - 3rd parameter "responseEncoding" should be optional
      .downloadAttachment(fileObj.pzInsKey, this.pConn$.getContextName())
      .then((content: any) => {
        const extension = fileObj.pyAttachName.split('.').pop();
        this.fileDownload(content.data, fileObj.pyFileName, extension);
      })
      .catch(e => {
        console.log(e);
      });
  }

  fileDownload = (data, fileName, ext) => {
    const file = ext ? `${fileName}.${ext}` : fileName;
    download(atob(data), file);
  };

  getAttachmentKey = (name = '') => (name ? `attachmentsList.${name}` : 'attachmentsList');

  getCurrentAttachmentsList(key, context) {
    return PCore.getStoreValue(`.${key}`, 'context_data', context) || [];
  }

  validateMaxSize(fileObj, maxSizeInMB): boolean {
    const fileSize = (fileObj.size / 1048576).toFixed(2);
    return parseFloat(fileSize) < parseFloat(maxSizeInMB);
  }

  validateFileExtension = (fileObj, allowedExtensions) => {
    if (!allowedExtensions) {
      return true;
    }
    const allowedExtensionList = allowedExtensions
      .toLowerCase()
      .split(',')
      .map(item => item.replaceAll('.', '').trim());
    const extension = fileObj.name.split('.').pop().toLowerCase();
    return allowedExtensionList.includes(extension);
  };

  updateAttachmentState(pConn, key, attachments) {
    PCore.getStateUtils().updateState(this.pConn$.getContextName(), key, attachments, {
      pageReference: 'context_data',
      isArrayDeepMerge: false
    });
  }

  deleteFile(file) {
    const attachmentsList: any[] = [];
    let currentAttachmentList = this.getCurrentAttachmentsList(this.getAttachmentKey(this.valueRef), this.pConn$.getContextName());

    // If file to be deleted is the one added in previous stage i.e. for which a file instance is created in server
    // no need to filter currentAttachmentList as we will get another entry of file in redux with delete & label

    if (this.value$ && this.value$?.pxResults && +this.value$?.pyCount > 0 && file.responseProps && file?.responseProps?.pzInsKey !== 'temp') {
      const updatedAttachments = this.files.map(f => {
        if (f.responseProps && f.responseProps.pzInsKey === file.responseProps.pzInsKey) {
          return { ...f, delete: true, label: this.valueRef };
        }
        return f;
      });

      // updating the redux store to help form-handler in passing the data to delete the file from server
      this.updateAttachmentState(this.pConn$, this.getAttachmentKey(this.valueRef), [...updatedAttachments]);
      const newlyAddedFiles = this.files.filter(f => !!f.ID);
      const filesPostDelete = this.files.filter(
        f => f.responseProps?.pzInsKey !== 'temp' && f.responseProps?.pzInsKey !== file.responseProps?.pzInsKey
      );
      this.files = [...filesPostDelete, ...newlyAddedFiles];
    } //  if the file being deleted is the added in this stage  i.e. whose data is not yet created in server
    else {
      // filter newly added files in this stage, later the updated current stage files will be added to redux once files state is updated
      currentAttachmentList = currentAttachmentList.filter(f => f.ID !== file.ID);
      this.files = this.files.filter(f => f.ID !== file.ID);

      this.updateAttachmentState(this.pConn$, this.getAttachmentKey(this.valueRef), [...currentAttachmentList, ...attachmentsList]);
      if (file.inProgress) {
        // @ts-ignore - 3rd parameter "responseEncoding" should be optional
        PCore.getAttachmentUtils().cancelRequest(file.ID, this.pConn$.getContextName());
      }
    }

    this.filesWithError = this.filesWithError?.filter(f => f.ID !== file.ID);
    if (this.filesWithError.length === 0) {
      this.clearFieldErrorMessages();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.fileInput && this.fileInput.nativeElement.value ? null : '';
  }

  onFileAdded(event) {
    let addedFiles = Array.from(event.target.files);
    addedFiles = this.allowMultiple$ ? addedFiles : [addedFiles[0]];
    const maxAttachmentSize = PCore.getEnvironmentInfo().getMaxAttachmentSize() || '5';
    this.tempFilesToBeUploaded = [
      ...addedFiles.map((f: any, index) => {
        f.ID = `${new Date().getTime()}I${index}`;
        f.inProgress = true;
        f.props = {
          type: f.type,
          name: f.name,
          icon: this.utils.getIconFromFileType(f.type),
          onDelete: () => this.deleteFile(f)
        };
        if (!this.validateMaxSize(f, maxAttachmentSize)) {
          f.props.error = true;
          f.inProgress = false;
          f.props.meta = this.pConn$.getLocalizedValue(`File is too big. Max allowed size is ${maxAttachmentSize}MB.`, '', '');
        } else if (!this.validateFileExtension(f, this.extensions$)) {
          f.props.error = true;
          f.inProgress = false;
          f.props.meta = `${this.pConn$.getLocalizedValue(
            'File has invalid extension. Allowed extensions are:',
            '',
            ''
          )} ${this.extensions$.replaceAll('.', '')}`;
        }
        if (f.props.error) {
          const fieldName = this.pConn$.getStateProps().value;
          const context = this.pConn$.getContextName();
          PCore.getMessageManager().addMessages({
            messages: [
              {
                type: 'error',
                message: this.pConn$.getLocalizedValue('Error with one or more files', '', '')
              }
            ],
            property: fieldName,
            pageReference: this.pConn$.getPageReference(),
            context
          });
        }
        return f;
      })
    ];
    const tempFilesWithError = this.tempFilesToBeUploaded.filter(f => f.props.error);
    if (tempFilesWithError.length > 0) {
      this.filesWithError = tempFilesWithError;
    }
    if (!this.allowMultiple$) {
      this.files = [...this.tempFilesToBeUploaded];
    } else {
      this.files = [...this.files, ...this.tempFilesToBeUploaded];
    }
    this.uploadFiles();
  }

  clearFieldErrorMessages() {
    const fieldName = this.pConn$.getStateProps().value;
    const context = this.pConn$.getContextName();
    PCore.getMessageManager().clearMessages({
      type: PCore.getConstants().MESSAGES.MESSAGES_TYPE_ERROR,
      property: fieldName,
      pageReference: this.pConn$.getPageReference(),
      context
    });
  }

  onUploadProgress() {}

  errorHandler(isFetchCanceled, attachedFile) {
    return error => {
      if (!isFetchCanceled(error)) {
        let uploadFailMsg = this.pConn$.getLocalizedValue('Something went wrong', '', '');
        if (error.response && error.response.data && error.response.data.errorDetails) {
          uploadFailMsg = this.pConn$.getLocalizedValue(error.response.data.errorDetails[0].localizedValue, '', '');
        }

        this.files.map(f => {
          if (f.ID === attachedFile.ID) {
            f.props.meta = uploadFailMsg;
            f.props.error = true;
            f.props.onDelete = () => this.deleteFile(f);
            f.props.icon = this.utils.getIconFromFileType(f.type);
            f.props.name = this.pConn$.getLocalizedValue('Unable to upload file', '', '');
            f.inProgress = false;
            const fieldName = this.pConn$.getStateProps().value;
            const context = this.pConn$.getContextName();
            // set errors to property to block submit even on errors in file upload
            PCore.getMessageManager().addMessages({
              messages: [
                {
                  type: 'error',
                  message: this.pConn$.getLocalizedValue('Error with one or more files', '', '')
                }
              ],
              property: fieldName,
              pageReference: this.pConn$.getPageReference(),
              context
            });
            delete f.props.progress;
          }
          return f;
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
        const isFileUploadedinLastStep = e.responseProps && e.responseProps.pzInsKey;
        return !isFileUploaded && !fileHasError && !isFileUploadedinLastStep;
      })
      .map(f =>
        window.PCore.getAttachmentUtils().uploadAttachment(
          f,
          () => {
            this.onUploadProgress();
          },
          isFetchCanceled => {
            return this.errorHandler(isFetchCanceled, f);
          },
          this.pConn$.getContextName()
        )
      );
    Promise.allSettled(filesToBeUploaded)
      .then((fileResponses: any) => {
        fileResponses = fileResponses.filter(fr => fr.status !== 'rejected'); // in case of deleting an in progress file, promise gets cancelled but still enters then block
        if (fileResponses.length > 0) {
          this.files.forEach(f => {
            const index = fileResponses.findIndex((fr: any) => fr.value.clientFileID === f.ID);
            if (index >= 0) {
              f.props.meta = this.pConn$.getLocalizedValue('Uploaded successfully', '', '');
              f.props.progress = 100;
              f.inProgress = false;
              f.handle = fileResponses[index].value.ID;
              f.label = this.valueRef;
              f.category = this.categoryName;
              f.responseProps = {
                pzInsKey: 'temp',
                pyAttachName: f.props.name
              };
            }
          });
          this.updateAttachments();
          if (this.filesWithError?.length === 0) {
            this.clearFieldErrorMessages();
          }
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

    PCore.getPubSubUtils().unsubscribe(PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.ASSIGNMENT_SUBMISSION, this.caseID);
  }
}
