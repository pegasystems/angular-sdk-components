import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { deleteInstruction, insertInstruction } from '../../../_helpers/instructions-utils';
import { handleEvent } from '../../../_helpers/event-util';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';
import { FieldBase } from '../field.base';

interface SelectableCardProps extends PConnFieldProps {
  selectionList: any;
  readonlyContextList: any;
  image: string;
  primaryField: string;
  selectionKey: string;
  renderMode: string;
  hideFieldLabels?: boolean;
  additionalProps?: any;
  imagePosition?: string;
  imageSize?: string;
  showImageDescription?: boolean;
  datasource?: any;
}

@Component({
  selector: 'lib-selectable-card',
  imports: [MatCardModule, CommonModule, MatRadioModule, MatCheckboxModule],
  templateUrl: './selectable-card.component.html',
  styleUrl: './selectable-card.component.scss'
})
export class SelectableCardComponent extends FieldBase implements OnInit {
  @Input() type: string;
  @Output() valueChange: EventEmitter<any> = new EventEmitter();

  configProps$: SelectableCardProps;
  readOnly = false;
  disabled = false;
  radioBtnValue;
  additionalProps;
  showNoValue = false;
  selectionKey?: string;
  defaultStyle = {};
  specialStyle = {};
  cardStyle: { [key: string]: any; imageWidth?: string } = {};
  selectedvalues: any;
  selectionList: any;
  primaryField: string;
  commonProps: any = {};
  contentList: [
    {
      commonCardProps: { id: string; key: string; fields: any; label: string; selected: boolean };
      cardImage: { src: string; alt: string; style: any };
    }
  ];

  override ngOnInit(): void {
    super.ngOnInit();

    // styles used in displaying common field props
    this.defaultStyle = {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      margin: '0.5rem',
      wordBreak: 'break-word',
      fontSize: '0.875rem'
    };
    this.specialStyle = {
      margin: '0.5rem',
      fontSize: '0.875rem'
    };
  }

  override updateSelf(): void {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as SelectableCardProps;

    const hideFieldLabels = this.configProps$.hideFieldLabels;
    const datasource: any = this.configProps$.datasource;
    const additionalProps: any = this.configProps$.additionalProps;
    const imageSize: string = this.configProps$.imageSize ?? '';
    const showImageDescription: boolean = this.configProps$.showImageDescription ?? false;
    const imagePosition = this.configProps$.imagePosition ?? '';

    this.setCardStyle(imagePosition);

    let image: any = {};
    let recordKey = '';
    let cardLabel = '';
    let cardDataSource: any[] = [];

    if (this.type === 'radio') {
      ({ image, recordKey, cardLabel } = this.getRadioProps(imagePosition, imageSize, showImageDescription));
      this.value$ = this.configProps$.value;
      this.radioBtnValue = this.value$;
    }

    if (this.type === 'checkbox') {
      this.testId = this.configProps$.testId;
      this.displayMode$ = this.configProps$.displayMode ?? '';

      this.selectionKey = this.configProps$.selectionKey;
      recordKey = this.selectionKey?.split('.').pop() ?? '';
      cardLabel = this.configProps$.primaryField.split('.').pop() ?? '';

      image = {
        imagePosition,
        imageSize,
        showImageDescription,
        imageField: this.configProps$.image?.split('.').pop(),
        imageDescription: (this.pConn$?.getRawMetadata()?.config as any).imageDescription?.split('.').pop()
      };

      this.selectionList = this.configProps$.selectionList;
      this.selectedvalues = this.configProps$.readonlyContextList;
      this.showNoValue = this.readOnly && this.selectedvalues?.length === 0; // not used
      this.primaryField = this.configProps$.primaryField;
      cardDataSource = this.readOnly || this.displayMode$ == 'DISPLAY_ONLY' ? this.selectedvalues || [] : this.configProps$.datasource?.source;
    }

    this.commonProps = { hideFieldLabels, datasource, additionalProps, image, recordKey, cardLabel, radioBtnValue: this.radioBtnValue ?? '' };
    const imageDescriptionKey = this.commonProps?.image?.showImageDescription ? this.commonProps?.image?.imageDescription : undefined;

    this.contentList = (cardDataSource || []).map(item => this.createContentItem(item, imageDescriptionKey, imagePosition));
  }

  fieldOnChange(value: any) {
    handleEvent(this.actionsApi, 'changeNblur', this.propName, value);
  }

  fieldOnBlur() {
    this.pConn$.getValidationApi().validate(this.selectedvalues, this.selectionList);
  }

  handleChangeMultiMode(event, element) {
    if (!element.selected) {
      insertInstruction(this.pConn$, this.selectionList, this.selectionKey, this.primaryField, {
        id: element.id,
        primary: element.label
      });
    } else {
      deleteInstruction(this.pConn$, this.selectionList, this.selectionKey, {
        id: element.key,
        primary: element.label
      });
    }
    this.pConn$.clearErrorMessages({
      property: this.selectionList,
      category: '',
      context: ''
    });
  }

  cardSelect(event, element) {
    if (this.type === 'radio') {
      this.fieldOnChange(element.key);
    } else if (this.type === 'checkbox') {
      this.handleChangeMultiMode(event, element);
    }
  }

  private setCardStyle(imagePosition?: string): void {
    let imageWidth = '100%';
    this.cardStyle = { display: 'flex', flexDirection: 'column', height: '100%' };
    if (imagePosition && imagePosition !== 'block-start') {
      imageWidth = '30%';
      if (imagePosition === 'inline-start') {
        this.cardStyle = { display: 'flex', flexDirection: 'row', alignItems: this.readOnly ? 'center' : '' };
      } else if (imagePosition === 'inline-end') {
        this.cardStyle = {
          display: 'flex',
          flexDirection: 'row-reverse',
          justifyContent: this.readOnly ? 'space-between' : '',
          alignItems: this.readOnly ? 'center' : ''
        };
      }
    }
    this.cardStyle.imageWidth = imageWidth;
  }

  private getRadioProps(imagePosition: string, imageSize: string, showImageDescription: boolean) {
    const stateProps = this.pConn$.getStateProps();
    return {
      image: {
        imagePosition,
        imageSize,
        showImageDescription,
        imageField: stateProps.image?.split('.').pop(),
        imageDescription: stateProps.imageDescription?.split('.').pop()
      },
      recordKey: stateProps.value?.split('.').pop() ?? '',
      cardLabel: stateProps.primaryField?.split('.').pop() ?? ''
    };
  }

  private getCheckboxProps(imagePosition: string, imageSize: string, showImageDescription: boolean) {
    const imageDescription = (this.pConn$?.getRawMetadata()?.config as any).imageDescription?.split('.').pop();
    return {
      image: {
        imagePosition,
        imageSize,
        showImageDescription,
        imageField: this.configProps$.image?.split('.').pop(),
        imageDescription
      },
      recordKey: this.configProps$.selectionKey?.split('.').pop() ?? '',
      cardLabel: this.configProps$.primaryField.split('.').pop() ?? ''
    };
  }

  private createContentItem(item: any, imageDescriptionKey: string | undefined, imagePosition: string) {
    const resolvedFields = this.utils.resolveReferenceFields(item, this.commonProps.hideFieldLabels, this.commonProps.recordKey, this.pConn$);
    const selected = this.selectedvalues
      ? this.selectedvalues?.some?.(data => data[this.commonProps.recordKey] === item[this.commonProps.recordKey])
      : false;
    const cardImage = item[this.commonProps.image.imageField]
      ? {
          src: item[this.commonProps.image.imageField],
          alt: this.commonProps.image.showImageDescription && imageDescriptionKey ? item[imageDescriptionKey] : '',
          style: {
            width: this.cardStyle.imageWidth,
            backgroundColor: 'rgb(233, 238, 243)',
            aspectRatio: '16/9',
            maxHeight: '100%',
            objectFit: 'contain',
            maxWidth: '100%',
            height: this.readOnly && imagePosition !== 'block-start' ? '5rem' : ''
          }
        }
      : undefined;

    return {
      cardImage,
      commonCardProps: {
        id: item[this.commonProps.recordKey],
        key: item[this.commonProps.recordKey],
        fields: resolvedFields,
        label: item[this.commonProps.cardLabel],
        selected
      }
    };
  }
}
