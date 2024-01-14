import { Component, OnInit, Input, NgZone, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import download from 'downloadjs';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

interface FileUtilityProps {
  // If any, enter additional props that only exist on this component
  label?: string;
}

@Component({
  selector: 'app-file-utility',
  templateUrl: './file-utility.component.html',
  styleUrls: ['./file-utility.component.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, forwardRef(() => ComponentMapperComponent)]
})
export class FileUtilityComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;

  // For interaction with AngularPConnect
  angularPConnectData: AngularPConnectData = {};

  arFullListAttachments: any[] = [];

  lu_name$ = '';
  lu_icon$ = '';
  lu_bLoading$ = false;
  lu_count$ = 0;
  lu_arActions$: any[] = [];
  lu_arItems$: any = [];

  va_arItems$: any[] = [];

  lu_onViewAllFunction: any;

  bShowFileModal$ = false;
  bShowLinkModal$ = false;
  bShowViewAllModal$ = false;

  arFileMainButtons$: any[] = [];
  arFileSecondaryButtons$: any[] = [];

  arLinkMainButtons$: any[] = [];
  arLinkSecondaryButtons$: any[] = [];

  arFiles$: any[] = [];
  arFileList$: any[] = [];
  removeFileFromList$: any;

  arLinks$: any[] = [];
  arLinksList$: any[] = [];
  removeLinksFromList$: any;

  link_title$ = '';
  link_url$ = '';

  closeSvgIcon$ = '';

  currentCaseID = '';

  addAttachmentsActions: any[] = [
    {
      text: 'Add files',
      id: 'addNewFiles',
      onClick: () => this.createModal('addLocalFile')
    },
    {
      text: 'Add links',
      id: 'addNewLinks',
      onClick: () => this.createModal('addLocalLink')
    }
  ];

  constructor(
    private angularPConnect: AngularPConnectService,
    private utils: Utils,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    const configProps: FileUtilityProps = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());

    this.lu_name$ = configProps.label ?? '';
    this.lu_icon$ = 'paper-clip';

    this.closeSvgIcon$ = this.utils.getImageSrc('times', this.utils.getSDKStaticContentUrl());

    // const onViewAllCallback = () => this.onViewAll(this.arFullListAttachments);

    this.lu_onViewAllFunction = { onClick: this.onViewAll.bind(this) };

    this.removeFileFromList$ = { onClick: this.removeFileFromList.bind(this) };
    this.removeLinksFromList$ = { onClick: this.removeLinksFromList.bind(this) };

    this.updateSelf();

    this.createModalButtons();

    PCore.getPubSubUtils().subscribe(
      (PCore.getEvents().getCaseEvent() as any).CASE_ATTACHMENTS_UPDATED_FROM_CASEVIEW,
      this.updateSelf.bind(this),
      'caseAttachmentsUpdateFromCaseview'
    );
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }

    PCore.getPubSubUtils().unsubscribe(
      (PCore.getEvents().getCaseEvent() as any).CASE_ATTACHMENTS_UPDATED_FROM_CASEVIEW,
      'caseAttachmentsUpdateFromCaseview'
    );
  }

  // Callback passed when subscribing to store change
  onStateChange() {
    // adding a property to track in configProps, when ever the attachment file changes
    // need to trigger a redraw
    this.pConn$.registerAdditionalProps({
      lastRefreshTime: `@P ${PCore.getConstants().SUMMARY_OF_ATTACHMENTS_LAST_REFRESH_TIME}`
    });

    // Should always check the bridge to see if the component should update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // ONLY call updateSelf when the component should update
    if (bUpdateSelf || this.caseHasChanged()) {
      this.updateSelf();
    }
  }

  onAttachFiles(files) {
    const attachmentUtils = PCore.getAttachmentUtils();
    // @ts-ignore - second parameter pageReference for getValue method should be optional
    const caseID = this.pConn$.getValue(PCore.getConstants().CASE_INFO.CASE_INFO_ID);

    if (files.length > 0) {
      this.lu_bLoading$ = true;
    }

    // const uploadedFiles = [];

    for (const file of files) {
      attachmentUtils
        .uploadAttachment(file, this.onUploadProgress, this.errorHandler, this.pConn$.getContextName())
        .then(fileResponse => {
          if (fileResponse.type === 'File') {
            (attachmentUtils.linkAttachmentsToCase(caseID, [fileResponse], 'File', this.pConn$.getContextName()) as Promise<any>)
              .then(() => {
                this.refreshAttachments();
              })
              .catch(console.error);
          }
        })
        .catch(console.error);
    }

    this.arFileList$ = [];
  }

  refreshAttachments() {
    this.updateSelf();
  }

  onUploadProgress() {}

  errorHandler() {}

  onAttachLinks(links) {
    const attachmentUtils = PCore.getAttachmentUtils();
    // @ts-ignore - second parameter pageReference for getValue method should be optional
    const caseID = this.pConn$.getValue(PCore.getConstants().CASE_INFO.CASE_INFO_ID);

    if (links.length > 0) {
      this.lu_bLoading$ = true;
    }

    const linksToAttach = links.map(link => ({
      type: 'URL',
      category: 'URL',
      url: link.url,
      name: link.linkTitle
    }));

    (attachmentUtils.linkAttachmentsToCase(caseID, linksToAttach, 'URL', this.pConn$.getContextName()) as Promise<any>)
      .then(() => {
        this.refreshAttachments();
      })
      .catch(console.log);
  }

  addAttachments(attsFromResp: any[] = []) {
    this.lu_bLoading$ = false;

    attsFromResp = attsFromResp.map(respAtt => {
      const updatedAtt = {
        ...respAtt,
        meta: `${respAtt.category} . ${this.utils.generateDateTime(respAtt.createTime, 'DateTime-Since')}, ${respAtt.createdBy}`
      };
      if (updatedAtt.type === 'FILE') {
        updatedAtt.nameWithExt = updatedAtt.fileName;
      }
      return updatedAtt;
    });

    return attsFromResp;
  }

  onViewAll(): void {
    this.bShowViewAllModal$ = true;

    // add clickAway listener
    window.addEventListener('mouseup', this._clickAway.bind(this));
  }

  _clickAway(event: any) {
    let bInPopUp = false;

    // run through list of elements in path, if menu not in th path, then want to
    // hide (toggle) the menu
    for (const i in event.path) {
      if (event.path[i].className == 'psdk-modal-file-top' || event.path[i].tagName == 'BUTTON') {
        bInPopUp = true;
        break;
      }
    }
    if (!bInPopUp) {
      this.bShowViewAllModal$ = false;

      window.removeEventListener('mouseup', this._clickAway.bind(this));
    }
  }

  _closeViewAll() {
    this.bShowViewAllModal$ = false;

    window.removeEventListener('mouseup', this._clickAway.bind(this));
  }

  removeFileFromList(item: any) {
    if (item != null) {
      for (const fileIndex in this.arFileList$) {
        if (this.arFileList$[fileIndex].id == item.id) {
          // remove the file from the list and redraw
          this.ngZone.run(() => {
            this.arFileList$.splice(parseInt(fileIndex, 10), 1);
          });
          break;
        }
      }
    }
  }

  removeLinksFromList(item: any) {
    const localLinksList = this.arLinksList$.slice();

    if (item != null) {
      for (const linkIndex in localLinksList) {
        if (localLinksList[linkIndex].id == item.id) {
          // remove the file from the list and redraw

          localLinksList.splice(parseInt(linkIndex, 10), 1);

          this.ngZone.run(() => {
            this.arLinksList$ = localLinksList.slice();
          });

          break;
        }
      }
    }
  }

  getNewListUtilityItemProps = ({ att, cancelFile, downloadFile, deleteFile, removeFile }) => {
    let actions;
    let isDownloadable = false;

    if (att.progress && att.progress !== 100) {
      actions = [
        {
          id: `Cancel-${att.ID}`,
          text: 'Cancel',
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
            text: isFile ? 'Download' : 'Open',
            icon: isFile ? 'download' : 'open',
            onClick: downloadFile
          }
        ],
        [
          'delete',
          {
            id: `Delete-${ID}`,
            text: 'Delete',
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
          text: 'Remove',
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
        name: att.name,
        icon: 'trash',
        click: removeFile
      },
      secondary: {
        text: att.meta
      },
      actions
    };
  };

  getListUtilityItemProps = ({ att, cancelFile, downloadFile, deleteFile, removeFile }) => {
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
        name: att.name,
        icon: 'open',
        click: downloadFile
      },
      secondary: {
        text: att.meta
      },
      actions
    };
  };

  _addLink() {
    // copy list locally
    const localList = this.arLinksList$.slice();

    const url = this.link_url$;

    if (!/^(http|https):\/\//.test(this.link_url$)) {
      this.link_url$ = `http://${this.link_url$}`;
    }

    // list for display
    let oLink: any = {};
    oLink.icon = 'chain';

    oLink.ID = `${new Date().getTime()}`;

    oLink = this.getNewListUtilityItemProps({
      att: oLink,
      downloadFile: null,
      cancelFile: null,
      deleteFile: null,
      removeFile: null
    });

    oLink.type = 'URL';
    oLink.primary.type = oLink.type;
    oLink.visual.icon = 'chain';
    oLink.primary.name = this.link_title$;
    oLink.primary.icon = 'open';
    oLink.secondary.text = url;

    this.ngZone.run(() => {
      // need to create a new array or summary list won't detect changes
      this.arLinksList$ = localList.slice();
      this.arLinksList$.push(oLink);

      // list for actually attachments
      const link: any = {};
      link.id = oLink.id;
      link.linkTitle = this.link_title$;
      link.type = oLink.type;
      link.url = url;

      this.arLinks$.push(link);

      // clear values
      this.link_title$ = '';
      this.link_url$ = '';
    });
  }

  _changeTitle(event: any) {
    this.link_title$ = event.srcElement.value;
  }

  _changeUrl(event: any) {
    this.link_url$ = event.srcElement.value;
  }

  downloadFile(att: any) {
    const attachUtils = PCore.getAttachmentUtils();
    const { ID, name, extension, type } = att;
    const context = this.pConn$.getContextName();

    attachUtils
      // @ts-ignore - 3rd parameter "responseEncoding" is optional
      .downloadAttachment(ID, context)
      .then(content => {
        if (type === 'FILE') {
          this.fileDownload(content.data, name, extension);
        } else if (type === 'URL') {
          let { data } = content;
          if (!/^(http|https):\/\//.test(data)) {
            data = `//${data}`;
          }
          window.open(content.data, '_blank');
        }
      })
      .catch(console.error);
  }

  fileDownload = (data, fileName, ext) => {
    const file = ext ? `${fileName}.${ext}` : fileName;
    download(atob(data), file);
  };

  cancelFile() {
    alert('cancel');
  }

  deleteFile(att: any) {
    setTimeout(() => {
      const attachUtils = PCore.getAttachmentUtils();
      const { ID } = att;
      const context = this.pConn$.getContextName();

      attachUtils
        .deleteAttachment(ID, context)
        .then(() => {
          this.updateSelf();
          // let newAttachments;
          // setAttachments((current) => {
          //   newAttachments = current.filter((file) => file.ID !== ID);
          //   return newAttachments;
          // });
          // if (callbackFn) {
          //   callbackFn(newAttachments);
          // }
        })
        .catch(console.error);
    });
  }

  removeFile() {
    alert('remove');
  }

  removeNewFile() {
    alert('remove');
  }

  createModal(modalType: string) {
    switch (modalType) {
      case 'addLocalFile':
        this.ngZone.run(() => {
          this.bShowFileModal$ = true;
        });

        break;
      case 'addLocalLink':
        this.ngZone.run(() => {
          this.bShowLinkModal$ = true;
        });
        break;
      default:
        break;
    }
  }

  createModalButtons() {
    this.arFileMainButtons$.push({ actionID: 'attach', jsAction: 'attachFiles', name: this.pConn$.getLocalizedValue('Attach files', '', '') });
    this.arFileSecondaryButtons$.push({ actionID: 'cancel', jsAction: 'cancel', name: this.pConn$.getLocalizedValue('Cancel', '', '') });

    this.arLinkMainButtons$.push({ actionID: 'attach', jsAction: 'attachLinks', name: this.pConn$.getLocalizedValue('Attach links', '', '') });
    this.arLinkSecondaryButtons$.push({ actionID: 'cancel', jsAction: 'cancel', name: this.pConn$.getLocalizedValue('Cancel', '', '') });
  }

  uploadMyFiles($event) {
    // alert($event.target.files[0]); // outputs the first file
    this.arFiles$ = this.getFiles($event.target.files);

    // convert FileList to an array
    const myFiles = Array.from(this.arFiles$);

    this.arFileList$ = myFiles.map(att => {
      return this.getNewListUtilityItemProps({
        att,
        downloadFile: !att.progress ? () => this.downloadFile(att) : null,
        cancelFile: att.progress ? () => this.cancelFile() : null,
        deleteFile: !att.progress ? () => this.deleteFile(att) : null,
        removeFile: att.error ? () => this.removeNewFile() : null
      });
    });
  }

  getFiles(arFiles: any[]): any[] {
    return this.setNewFiles(arFiles);
  }

  setNewFiles(arFiles) {
    let index = 0;
    for (const file of arFiles) {
      if (!this.validateMaxSize(file, 5)) {
        file.error = true;
        file.meta = 'File is too big. Max allowed size is 5MB.';
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

  onFileActionButtonClick(event: any) {
    // modal buttons
    switch (event.action) {
      case 'cancel':
        this.bShowFileModal$ = false;

        this.clearOutFiles();
        break;
      case 'attachFiles':
        this.bShowFileModal$ = false;
        this.onAttachFiles(this.arFiles$);

        this.clearOutFiles();
        break;
      default:
        break;
    }
  }

  onLinkActionButtonClick(event: any) {
    // modal buttons
    switch (event.action) {
      case 'cancel':
        this.bShowLinkModal$ = false;

        this.clearOutLinks();
        break;
      case 'attachLinks':
        this.bShowLinkModal$ = false;
        this.onAttachLinks(this.arLinks$);

        this.clearOutLinks();
        break;
      default:
        break;
    }
  }

  clearOutFiles() {
    this.arFileList$ = [];
    this.arFiles$ = [];
  }

  clearOutLinks() {
    this.arLinksList$ = [];
    this.arLinks$ = [];
    this.link_title$ = '';
    this.link_url$ = '';
  }

  addALink() {}

  _fieldOnChangeLink(event: any) {
    this.link_title$ = event.target.value;
  }

  _fieldOnChangeURL(event: any) {
    this.link_url$ = event.target.value;
  }

  updateSelf() {
    const attachmentUtils = PCore.getAttachmentUtils();
    // @ts-ignore - second parameter pageReference for getValue method should be optional
    const caseID = this.pConn$.getValue(PCore.getConstants().CASE_INFO.CASE_INFO_ID);

    if (caseID && caseID != '') {
      const attPromise = attachmentUtils.getCaseAttachments(caseID, this.pConn$.getContextName());

      this.lu_bLoading$ = true;

      attPromise.then(resp => {
        this.arFullListAttachments = this.addAttachments(resp);
        this.lu_count$ = this.arFullListAttachments.length;
        this.lu_arActions$ = this.addAttachmentsActions;

        this.lu_arItems$ = this.arFullListAttachments.slice(0, 3).map(att => {
          return this.getListUtilityItemProps({
            att,
            downloadFile: !att.progress ? () => this.downloadFile(att) : null,
            cancelFile: att.progress ? () => this.cancelFile() : null,
            deleteFile: !att.progress ? () => this.deleteFile(att) : null,
            removeFile: att.error ? () => this.removeFile() : null
          });
        });

        this.va_arItems$ = this.arFullListAttachments.map(att => {
          return this.getListUtilityItemProps({
            att,
            downloadFile: !att.progress ? () => this.downloadFile(att) : null,
            cancelFile: att.progress ? () => this.cancelFile() : null,
            deleteFile: !att.progress ? () => this.deleteFile(att) : null,
            removeFile: att.error ? () => this.removeFile() : null
          });
        });
      });
    }
  }

  caseHasChanged(): boolean {
    // @ts-ignore - second parameter pageReference for getValue method should be optional
    const caseID = this.pConn$.getValue(PCore.getConstants().CASE_INFO.CASE_INFO_ID);
    if (this.currentCaseID !== caseID) {
      this.currentCaseID = caseID;
      return true;
    }

    return false;
  }
}
