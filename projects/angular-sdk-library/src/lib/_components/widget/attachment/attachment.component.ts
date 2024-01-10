/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, OnInit, Input, NgZone, forwardRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import download from 'downloadjs';

import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface AttachmentProps extends Omit<PConnFieldProps, 'value'> {
  // If any, enter additional props that only exist on this component
  value: any;
  extensions: any;
}

declare const PCore: any;
@Component({
  selector: 'app-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss'],
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule, forwardRef(() => ComponentMapperComponent)]
})
export class AttachmentComponent implements OnInit {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  // For interaction with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  PCoreVersion: string;

  label$: string = '';
  value$: any;
  allowMultiple$: boolean = false;
  extensions$: any = '';
  bRequired$: boolean = false;
  bReadonly$: boolean = false;
  bDisabled$: boolean = false;
  bVisible$: boolean = true;
  bLoading$: boolean = false;
  arFiles$: Array<any> = [];
  arFileList$: Array<any> = [];
  arFilesWithError: Array<any> = [];
  removeFileFromList$: any;
  arMenuList$: Array<any> = [];
  bShowSelector$: boolean = true;
  bShowJustDelete$: boolean = false;
  att_valueRef: any;
  att_categoryName: string;
  att_id: string;
  myFiles: any;
  fileTemp: any = {};
  caseID: any;
  status: any;
  validatemessage: any = '';
  valueRef: any;
  imagePath$: any;

  constructor(
    private angularPConnect: AngularPConnectService,
    private utils: Utils,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    this.removeFileFromList$ = { onClick: this._removeFileFromList.bind(this) };
    this.PCoreVersion = PCore.getPCoreVersion();

    this.caseID = PCore.getStoreValue('.pyID', 'caseInfo.content', this.pConn$.getContextName());

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

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }

    PCore.getPubSubUtils().unsubscribe(PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.ASSIGNMENT_SUBMISSION, this.caseID);
  }

  // Callback passed when subscribing to store change
  onStateChange() {
    this.checkAndUpdate();
  }

  updateSelf() {
    const configProps: AttachmentProps = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as AttachmentProps;
    const stateProps: any = this.pConn$.getStateProps();

    const { value, label, extensions } = configProps;

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

    if (configProps['allowMultiple'] != null) {
      this.allowMultiple$ = this.utils.getBooleanValue(configProps['allowMultiple']);
    }

    this.label$ = label;
    this.value$ = value;
    this.status = stateProps.status;
    this.validatemessage = this.angularPConnectData.validateMessage;
    this.extensions$ = extensions;
    this.valueRef = this.pConn$.getStateProps()['value'];
    this.valueRef = this.valueRef.indexOf('.') === 0 ? this.valueRef.substring(1) : this.valueRef;

    /* this is a temporary fix because required is supposed to be passed as a boolean and NOT as a string */
    let { required, disabled } = configProps;
    [required, disabled] = [required, disabled].map((prop) => prop === true || (typeof prop === 'string' && prop === 'true'));

    this.att_categoryName = '';
    if (value && value.pyCategoryName) {
      this.att_categoryName = value.pyCategoryName;
    }

    this.att_valueRef = (this.pConn$.getStateProps() as any).value;
    this.att_valueRef = this.att_valueRef.indexOf('.') === 0 ? this.att_valueRef.substring(1) : this.att_valueRef;

    if (value && value.pxResults && +value.pyCount > 0) {
      this.fileTemp = value.pxResults.map((attach) => this.buildFilePropsFromResponse(attach));

      this.fileTemp.forEach((file, i) => {
        if (file.responseProps) {
          // @ts-ignore - Property 'attachmentsInfo' does not exist on type 'C11nEnv'
          if (!this.pConn$.attachmentsInfo) {
            // @ts-ignore - Property 'attachmentsInfo' does not exist on type 'C11nEnv'
            this.pConn$.attachmentsInfo = {
              type: 'File',
              attachmentFieldName: this.att_valueRef,
              category: this.att_categoryName
            };
          }

          if (file.responseProps.pzInsKey && !file.responseProps.pzInsKey.includes('temp')) {
            file.props.type = file.responseProps.pyMimeFileExtension;
            file.props.mimeType = file.responseProps.pyMimeFileExtension;
            file.props.ID = file.responseProps.pzInsKey;

            // create the actions for the "more" menu on the attachment
            const arMenuList: Array<any> = [];
            let oMenu: any = {};

            oMenu.icon = 'download';
            oMenu.text = this.pConn$.getLocalizedValue('Download', '', '');
            oMenu.onClick = () => {
              this._downloadFileFromList(this.value$.pxResults[i]);
            };
            arMenuList.push(oMenu);
            oMenu = {};
            oMenu.icon = 'trash';
            oMenu.text = this.pConn$.getLocalizedValue('Delete', '', '');
            oMenu.onClick = () => {
              this._removeFileFromList(this.arFileList$[i]);
            };
            arMenuList.push(oMenu);

            this.arFileList$.push(
              this.getNewListUtilityItemProps({
                att: file.props,
                downloadFile: null,
                cancelFile: null,
                deleteFile: null,
                removeFile: null
              })
            );

            this.arFileList$[i].actions = arMenuList;

            this.bShowSelector$ = false;
          }
          if (file) {
            const currentAttachmentList = this.getCurrentAttachmentsList(
              this.getAttachmentKey(this.PCoreVersion?.includes('8.23') ? this.att_valueRef : ''),
              this.pConn$.getContextName()
            );
            const index = currentAttachmentList.findIndex((element) => element.props.ID === file.props.ID);
            let tempFiles: any = [];
            if (index < 0) {
              tempFiles = [file];
            }
            PCore.getStateUtils().updateState(
              this.pConn$.getContextName(),
              this.getAttachmentKey(this.PCoreVersion?.includes('8.23') ? this.att_valueRef : ''),
              [...currentAttachmentList, ...tempFiles],
              {
                pageReference: 'context_data',
                isArrayDeepMerge: false
              }
            );
          }
        }
      });
    }
    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.ASSIGNMENT_SUBMISSION,
      this.resetAttachmentStoredState.bind(this),
      this.caseID
    );
  }

  resetAttachmentStoredState() {
    PCore.getStateUtils().updateState(
      this.pConn$.getContextName(),
      this.getAttachmentKey(this.PCoreVersion?.includes('8.23') ? this.att_valueRef : ''),
      undefined,
      {
        pageReference: 'context_data',
        isArrayDeepMerge: false
      }
    );
  }

  _downloadFileFromList(fileObj: any) {
    PCore.getAttachmentUtils()
      // @ts-ignore - 3rd parameter "responseEncoding" should be optional
      .downloadAttachment(fileObj.pzInsKey, this.pConn$.getContextName())
      .then((content) => {
        const extension = fileObj.pyAttachName.split('.').pop();
        this.fileDownload(content.data, fileObj.pyFileName, extension);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  fileDownload = (data, fileName, ext) => {
    const file = ext ? `${fileName}.${ext}` : fileName;
    download(atob(data), file);
  };

  getAttachmentKey = (name = '') => (name ? `attachmentsList.${name}` : 'attachmentsList');

  CheckForInvalidAttachment() {
    const currentAttachmentList = this.getCurrentAttachmentsList(
      this.getAttachmentKey(this.PCoreVersion?.includes('8.23') ? this.att_valueRef : ''),
      this.pConn$.getContextName()
    );

    let isValid = true;
    this.arFileList$.forEach((file) => {
      if (file.secondary.error) {
        isValid = false;
      }
    });
    if (isValid) {
      PCore.getMessageManager().clearMessages({
        type: PCore.getConstants().MESSAGES.MESSAGES_TYPE_ERROR,
        property: (this.pConn$.getStateProps() as any).value,
        pageReference: this.pConn$.getPageReference(),
        context: this.pConn$.getContextName()
      });
    }
  }

  _removeFileFromList(item: any) {
    const fileListIndex = this.arFileList$.findIndex((element) => element?.id === item?.id);
    const fileIndex = this.arFiles$.findIndex((element) => element?.ID === item?.id);

    const attachmentsList = [];
    let currentAttachmentList = this.getCurrentAttachmentsList(
      this.getAttachmentKey(this.PCoreVersion?.includes('8.23') ? this.att_valueRef : ''),
      this.pConn$.getContextName()
    );
    if (this.value$ && this.value$.pxResults && +this.value$.pyCount > 0) {
      const deletedFile = {
        type: 'File',
        label: this.att_valueRef,
        delete: true,
        responseProps: {
          pzInsKey: this.arFileList$[fileListIndex].id
        }
      };
      // updating the redux store to help form-handler in passing the data to delete the file from server
      PCore.getStateUtils().updateState(
        this.pConn$.getContextName(),
        this.getAttachmentKey(this.PCoreVersion?.includes('8.23') ? this.att_valueRef : ''),
        [...currentAttachmentList, deletedFile],
        {
          pageReference: 'context_data',
          isArrayDeepMerge: false
        }
      );
    } else {
      currentAttachmentList = currentAttachmentList.filter((f) => f.ID !== item.id);
      PCore.getStateUtils().updateState(
        this.pConn$.getContextName(),
        this.getAttachmentKey(this.PCoreVersion?.includes('8.23') ? this.att_valueRef : ''),
        [...currentAttachmentList, ...attachmentsList],
        {
          pageReference: 'context_data',
          isArrayDeepMerge: false
        }
      );
    }

    if (fileListIndex > -1) {
      this.arFileList$.splice(fileListIndex, 1);
    }
    if (fileIndex > -1) {
      this.arFiles$.splice(fileIndex, 1);
    }

    this.CheckForInvalidAttachment();

    this.bShowSelector$ = !(this.arFileList$?.length > 0) || this.allowMultiple$;
  }

  getCurrentAttachmentsList(key, context) {
    return PCore.getStoreValue(`.${key}`, 'context_data', context) || [];
  }

  errorHandler(isFetchCanceled, file) {
    return (error) => {
      if (!isFetchCanceled(error)) {
        let uploadFailMsg = this.pConn$.getLocalizedValue('Something went wrong', '', '');
        if (error.response && error.response.data && error.response.data.errorDetails) {
          uploadFailMsg = this.pConn$.getLocalizedValue(error.response.data.errorDetails[0].localizedValue, '', '');
        }
        for (const myFile of this.myFiles) {
          if (myFile.ID === file.ID) {
            myFile.meta = uploadFailMsg;
            myFile.error = true;
            myFile.fileName = this.pConn$.getLocalizedValue('Unable to upload file', '', '');
          }
        }
        this.bShowSelector$ = false;
        this.arFileList$ = this.myFiles.map((att) => {
          return this.getNewListUtilityItemProps({
            att,
            downloadFile: null,
            cancelFile: null,
            deleteFile: null,
            removeFile: null
          });
        });

        PCore.getMessageManager().addMessages({
          messages: [
            {
              type: 'error',
              message: this.pConn$.getLocalizedValue('Error with one or more files', '', '')
            }
          ],
          property: (this.pConn$.getStateProps() as any).value,
          pageReference: this.pConn$.getPageReference(),
          context: this.pConn$.getContextName()
        });

        this.bShowJustDelete$ = true;
        this.bLoading$ = false;
      }
      throw error;
    };
  }

  uploadMyFiles(event: any) {
    this.arFiles$ = [...this.arFiles$, ...this.getFiles(event.target.files)];

    // convert FileList to an array
    this.myFiles = Array.from(this.arFiles$);

    this.bLoading$ = true;

    const filesToBeUploaded = this.myFiles
      .filter((e) => {
        const isFileUploaded = e && e.progress === 100;
        const fileHasError = e && e.error;
        const isFileUploadedinLastStep = e.responseProps && e.responseProps.pzInsKey;
        return !isFileUploaded && !fileHasError && !isFileUploadedinLastStep;
      })
      .map((f) =>
        PCore.getAttachmentUtils().uploadAttachment(
          f,
          () => {
            this.onUploadProgress();
          },
          (isFetchCanceled) => {
            return this.errorHandler(isFetchCanceled, f);
          },
          this.pConn$.getContextName()
        )
      );

    Promise.allSettled(filesToBeUploaded)
      .then((fileResponses: any) => {
        fileResponses = fileResponses.filter((fr) => fr.status !== 'rejected'); // in case of deleting an in progress file, promise gets cancelled but still enters then block
        let reqObj;
        if (fileResponses.length > 0) {
          const tempFilesUploaded = [...this.arFiles$];
          let newAttachments: any = [];
          tempFilesUploaded.forEach((fileRes) => {
            const index = fileResponses.findIndex((fr: any) => fr.value.clientFileID === fileRes.ID);
            if (index >= 0) {
              reqObj = {
                type: 'File',
                label: this.att_valueRef,
                category: this.att_categoryName,
                handle: fileResponses[index].value.ID,
                ID: fileRes.ID
              };
              newAttachments = [...newAttachments, reqObj];
            }
          });
          const currentAttachmentList = this.getCurrentAttachmentsList(
            this.getAttachmentKey(this.PCoreVersion?.includes('8.23') ? this.att_valueRef : ''),
            this.pConn$.getContextName()
          ).filter((f) => f.label !== this.att_valueRef);
          PCore.getStateUtils().updateState(
            this.pConn$.getContextName(),
            this.getAttachmentKey(this.PCoreVersion?.includes('8.23') ? this.att_valueRef : ''),
            [...currentAttachmentList, ...newAttachments],
            {
              pageReference: 'context_data',
              isArrayDeepMerge: false
            }
          );
          this.arFiles$ = tempFilesUploaded;

          this.ngZone.run(() => {
            this.bShowSelector$ = this.allowMultiple$;
            this.myFiles.forEach((file) => {
              if (!file.error) {
                file.meta = this.pConn$.getLocalizedValue('File uploaded successfully', '', '');
              }
            });
            this.arFileList$ = this.myFiles.map((att) => {
              return this.getNewListUtilityItemProps({
                att,
                downloadFile: null,
                cancelFile: null,
                deleteFile: null,
                removeFile: null
              });
            });

            this.CheckForInvalidAttachment();

            this.bShowJustDelete$ = true;
            this.bLoading$ = false;
          });
        }
      })
      .catch((error) => {
        console.log(error);
        this.bShowJustDelete$ = true;
        this.bLoading$ = false;
        this.bShowSelector$ = this.allowMultiple$;
        this.myFiles[0].meta = 'File uploaded failed';

        this.arFileList$ = this.myFiles.map((att) => {
          return this.getNewListUtilityItemProps({
            att,
            downloadFile: null,
            cancelFile: null,
            deleteFile: null,
            removeFile: null
          });
        });

        this.bShowJustDelete$ = true;
        this.bLoading$ = false;
      });
  }

  getNewListUtilityItemProps = ({ att, cancelFile, downloadFile, deleteFile, removeFile }) => {
    let actions;
    let isDownloadable = false;

    if (att.progress && att.progress !== 100) {
      actions = [
        {
          id: `Cancel-${att.ID}`,
          text: this.pConn$.getLocalizedValue('Cancel', '', ''),
          icon: 'times',
          onClick: cancelFile
        }
      ];
    } else if (att.links) {
      const isFile = att.type === 'FILE';
      const ID = att.ID.replace(/\s/gi, '');
      const actionsMap = new Map([
        [
          'download',
          {
            id: `download-${ID}`,
            text: isFile ? this.pConn$.getLocalizedValue('Download', '', '') : this.pConn$.getLocalizedValue('Open', '', ''),
            icon: isFile ? 'download' : 'open',
            onClick: downloadFile
          }
        ],
        [
          'delete',
          {
            id: `Delete-${ID}`,
            text: this.pConn$.getLocalizedValue('Delete', '', ''),
            icon: 'trash',
            onClick: deleteFile
          }
        ]
      ]);
      actions = [];
      actionsMap.forEach((action, actionKey) => {
        if (att.links[actionKey]) {
          actions.push(action);
        }
      });
      isDownloadable = att.links.download;
    } else if (att.error) {
      actions = [
        {
          id: `Remove-${att.ID}`,
          text: this.pConn$.getLocalizedValue('Remove', '', ''),
          icon: 'trash',
          onClick: removeFile
        }
      ];
    }

    return {
      id: att.ID,
      visual: {
        icon: this.utils.getIconForAttachment(att),
        progress: att.progress == 100 ? undefined : att.progress
      },
      primary: {
        type: att.type,
        name: att.error ? att.fileName : att.name,
        icon: 'trash',
        click: removeFile
      },
      secondary: {
        text: att.meta,
        error: att.error
      },
      actions
    };
  };

  onUploadProgress() {}

  getFiles(arFiles: Array<any>): Array<any> {
    const files = this.allowMultiple$ ? arFiles : [arFiles[0]];
    return this.setNewFiles(files);
  }

  setNewFiles(arFiles) {
    let index = 0;
    const maxAttachmentSize = PCore.getEnvironmentInfo().getMaxAttachmentSize() || 5;
    for (const file of arFiles) {
      file.mimeType = file.type;
      file.icon = this.utils.getIconFromFileType(file.type);
      file.ID = `${new Date().getTime()}I${index}`;

      if (!this.validateMaxSize(file, maxAttachmentSize)) {
        file.error = true;
        file.meta = this.pConn$.getLocalizedValue('File is too big. Max allowed size is 5MB.', '', '');
      } else if (!this.validateFileExtension(file, this.extensions$)) {
        file.error = true;
        file.meta = `${this.pConn$.getLocalizedValue('File has invalid extension. Allowed extensions are:', '', '')} ${this.extensions$.replaceAll(
          '.',
          ''
        )}`;
      }
      if (file.error) {
        const fieldName = (this.pConn$.getStateProps() as any).value;
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
      index++;
    }

    const tempFilesToBeUploaded = [...arFiles];
    return tempFilesToBeUploaded;
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
      .map((item) => item.replaceAll('.', '').trim());
    const extension = fileObj.name.split('.').pop().toLowerCase();
    return allowedExtensionList.includes(extension);
  };

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
}
