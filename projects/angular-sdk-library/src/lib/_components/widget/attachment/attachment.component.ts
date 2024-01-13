import { Component, OnInit, Input, NgZone, forwardRef, OnDestroy } from '@angular/core';
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
}

@Component({
  selector: 'app-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss'],
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule, forwardRef(() => ComponentMapperComponent)]
})
export class AttachmentComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  // For interaction with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  PCoreVersion: string;

  label$ = '';
  value$: any;
  bRequired$ = false;
  bReadonly$ = false;
  bDisabled$ = false;
  bVisible$ = true;
  bLoading$ = false;
  arFiles$: any[] = [];
  arFileList$: any[] = [];
  removeFileFromList$: any;
  arMenuList$: any[] = [];
  bShowSelector$ = true;
  bShowJustDelete$ = false;
  att_valueRef: any;
  att_categoryName: string;
  att_id: string;
  myFiles: any;
  fileTemp: any = {};
  caseID: any;
  status: any;
  validatemessage: any = '';

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

    // let configProps: any = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
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
    // this.att_id = '';

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

    const { value, label } = configProps;

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

    this.label$ = label;
    this.value$ = value;
    this.status = stateProps.status;
    this.validatemessage = stateProps.validateMessage;

    /* this is a temporary fix because required is supposed to be passed as a boolean and NOT as a string */
    let { required, disabled } = configProps;
    [required, disabled] = [required, disabled].map((prop) => prop === true || (typeof prop === 'string' && prop === 'true'));

    this.att_categoryName = '';
    if (value && value.pyCategoryName) {
      this.att_categoryName = value.pyCategoryName;
    }

    this.att_valueRef = (this.pConn$.getStateProps() as any).value;
    this.att_valueRef = this.att_valueRef.indexOf('.') === 0 ? this.att_valueRef.substring(1) : this.att_valueRef;

    // let this.fileTemp: any = {};

    if (value && value.pxResults && +value.pyCount > 0) {
      this.fileTemp = this.buildFilePropsFromResponse(value.pxResults[0]);

      if (this.fileTemp.responseProps) {
        // @ts-ignore - Property 'attachmentsInfo' does not exist on type 'C11nEnv'
        if (!this.pConn$.attachmentsInfo) {
          // @ts-ignore - Property 'attachmentsInfo' does not exist on type 'C11nEnv'
          this.pConn$.attachmentsInfo = {
            type: 'File',
            attachmentFieldName: this.att_valueRef,
            category: this.att_categoryName
          };
        }

        if (this.fileTemp.responseProps.pzInsKey && !this.fileTemp.responseProps.pzInsKey.includes('temp')) {
          this.fileTemp.props.type = this.fileTemp.responseProps.pyMimeFileExtension;
          this.fileTemp.props.mimeType = this.fileTemp.responseProps.pyMimeFileExtension;
          this.fileTemp.props.ID = this.fileTemp.responseProps.pzInsKey;

          // create the actions for the "more" menu on the attachment
          const arMenuList: any[] = [];
          let oMenu: any = {};

          oMenu.icon = 'download';
          oMenu.text = this.pConn$.getLocalizedValue('Download', '', '');
          oMenu.onClick = () => {
            this._downloadFileFromList(this.value$.pxResults[0]);
          };
          arMenuList.push(oMenu);
          oMenu = {};
          oMenu.icon = 'trash';
          oMenu.text = this.pConn$.getLocalizedValue('Delete', '', '');
          oMenu.onClick = () => {
            this._removeFileFromList(this.arFileList$[0]);
          };
          arMenuList.push(oMenu);

          this.arFileList$ = [];
          this.arFileList$.push(
            this.getNewListUtilityItemProps({
              att: this.fileTemp.props,
              downloadFile: null,
              cancelFile: null,
              deleteFile: null,
              removeFile: null
            })
          );

          this.arFileList$[0].actions = arMenuList;

          this.bShowSelector$ = false;
        }
        if (this.fileTemp) {
          const currentAttachmentList = this.getCurrentAttachmentsList(
            this.getAttachmentKey(this.PCoreVersion?.includes('8.23') ? this.att_valueRef : ''),
            this.pConn$.getContextName()
          );
          const index = currentAttachmentList.findIndex((element) => element.props.ID === this.fileTemp.props.ID);
          let tempFiles: any = [];
          if (index < 0) {
            tempFiles = [this.fileTemp];
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

  _removeFileFromList(item: any) {
    const fileIndex = this.arFileList$.findIndex((element) => element?.id === item?.id);
    if (PCore.getPCoreVersion()?.includes('8.7')) {
      if (this.value$) {
        // @ts-ignore - Property 'attachmentsInfo' does not exist on type 'C11nEnv'
        this.pConn$.attachmentsInfo = {
          type: 'File',
          attachmentFieldName: this.att_valueRef,
          delete: true
        };
      }
      if (fileIndex > -1) {
        this.arFileList$.splice(fileIndex, 1);
      }
    } else {
      const attachmentsList = [];
      const currentAttachmentList = this.getCurrentAttachmentsList(
        this.getAttachmentKey(this.PCoreVersion?.includes('8.23') ? this.att_valueRef : ''),
        this.pConn$.getContextName()
      ).filter((f) => f.label !== this.att_valueRef);
      if (this.value$ && this.value$.pxResults && +this.value$.pyCount > 0) {
        const deletedFile = {
          type: 'File',
          label: this.att_valueRef,
          delete: true,
          responseProps: {
            pzInsKey: this.arFileList$[fileIndex].id
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
      if (fileIndex > -1) {
        this.arFileList$.splice(fileIndex, 1);
      }
    }
    this.bShowSelector$ = !(this.arFileList$?.length > 0);
  }

  getCurrentAttachmentsList(key, context) {
    return PCore.getStoreValue(`.${key}`, 'context_data', context) || [];
  }

  errorHandler(isFetchCanceled) {
    return (error) => {
      if (!isFetchCanceled(error)) {
        let uploadFailMsg = this.pConn$.getLocalizedValue('Something went wrong', '', '');
        if (error.response && error.response.data && error.response.data.errorDetails) {
          uploadFailMsg = this.pConn$.getLocalizedValue(error.response.data.errorDetails[0].localizedValue, '', '');
        }
        this.bShowSelector$ = false;
        this.myFiles[0].meta = uploadFailMsg;
        this.myFiles[0].error = true;
        this.myFiles[0].fileName = this.pConn$.getLocalizedValue('Unable to upload file', '', '');
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
      }
      throw error;
    };
  }

  uploadMyFiles(event: any) {
    this.arFiles$ = this.getFiles(event.target.files);
    // convert FileList to an array
    this.myFiles = Array.from(this.arFiles$);

    // alert($event.target.files[0]); // outputs the first file

    if (this.myFiles.length == 1) {
      this.bLoading$ = true;

      // this.myFiles[0].ID = undefined;

      PCore.getAttachmentUtils()
        .uploadAttachment(this.myFiles[0], this.onUploadProgress, this.errorHandler, this.pConn$.getContextName())
        .then((fileRes) => {
          this.att_id = fileRes.ID;

          let reqObj;
          if (this.PCoreVersion?.includes('8.7')) {
            reqObj = {
              type: 'File',
              attachmentFieldName: this.att_valueRef,
              category: this.att_categoryName,
              ID: fileRes.ID
            };
            // @ts-ignore - Property 'attachmentsInfo' does not exist on type 'C11nEnv'
            this.pConn$.attachmentsInfo = reqObj;
          } else {
            reqObj = {
              type: 'File',
              label: this.att_valueRef,
              category: this.att_categoryName,
              handle: fileRes.ID,
              ID: fileRes.clientFileID
            };
            const currentAttachmentList = this.getCurrentAttachmentsList(
              this.getAttachmentKey(this.PCoreVersion?.includes('8.23') ? this.att_valueRef : ''),
              this.pConn$.getContextName()
            ).filter((f) => f.label !== this.att_valueRef);
            PCore.getStateUtils().updateState(
              this.pConn$.getContextName(),
              this.getAttachmentKey(this.PCoreVersion?.includes('8.23') ? this.att_valueRef : ''),
              [...currentAttachmentList, reqObj],
              {
                pageReference: 'context_data',
                isArrayDeepMerge: false
              }
            );
          }

          const fieldName = (this.pConn$.getStateProps() as any).value;
          const context = this.pConn$.getContextName();

          // @ts-ignore - category should be optional
          PCore.getMessageManager().clearMessages({
            type: PCore.getConstants().MESSAGES.MESSAGES_TYPE_ERROR,
            property: fieldName,
            pageReference: this.pConn$.getPageReference(),
            context
          });
          this.ngZone.run(() => {
            this.bShowSelector$ = false;
            this.myFiles[0].meta = this.pConn$.getLocalizedValue('File uploaded successfully', '', '');
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
        })

        .catch(() => {
          // just catching the rethrown error at uploadAttachment
          // to handle Unhandled rejections

          this.bShowJustDelete$ = true;
          this.bLoading$ = false;
          this.bShowSelector$ = false;
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  getFiles(arFiles: any[]): any[] {
    return this.setNewFiles(arFiles);
  }

  setNewFiles(arFiles) {
    let index = 0;
    const maxAttachmentSize = 5;
    for (const file of arFiles) {
      if (!this.validateMaxSize(file, maxAttachmentSize)) {
        file.error = true;
        file.meta = this.pConn$.getLocalizedValue('File is too big. Max allowed size is 5MB.', '', '');
      }
      file.mimeType = file.type;
      file.icon = this.utils.getIconFromFileType(file.type);
      file.ID = `${new Date().getTime()}I${index}`;
      index++;
    }

    return arFiles;
  }

  validateMaxSize(fileObj, maxSizeInMB): boolean {
    const fileSize = (fileObj.size / 1048576).toFixed(2);
    return fileSize < maxSizeInMB;
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
}
