import { Component, Input, forwardRef } from '@angular/core';
import { Utils } from '../../../_helpers/utils';
import { CommonModule } from '@angular/common';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { getCurrencyOptions } from '../../../_helpers/currency-utils';
import { format } from '../../../_helpers/formatters';

@Component({
  selector: 'app-material-details-fields',
  templateUrl: './material-details-fields.component.html',
  styleUrls: ['./material-details-fields.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class MaterialDetailsFieldsComponent {
  constructor(private utils: Utils) {}

  @Input() arFields$: any[];
  @Input() arHighlightedFields: any[];

  _getValue(configValue, field: any = {}) {
    if (field?.type === 'userreference') {
      return configValue.userName;
    }
    if (configValue && configValue != '') {
      return configValue;
    }
    return '---';
  }

  _formatDate(dateValue: string, dateFormat: string): string {
    return this.utils.generateDate(dateValue, dateFormat);
  }

  _formatDecimal(field: any): string {
    const { currencyISOCode = '', formatter } = field.config;

    const theCurrencyOptions = getCurrencyOptions(currencyISOCode);
    const formatterLower = formatter?.toLowerCase() || 'decimal';
    const formattedValue = format(field.config.value, formatterLower, theCurrencyOptions);

    return formattedValue;
  }

  _formatCurrency(field: any): string {
    const { currencyISOCode = 'USD', formatter } = field.config;

    const formattedValue = format(
      field.config.value,
      formatter ? (formatter.toLowerCase() === 'defaultcurrency' ? 'currency' : formatter.toLowerCase()) : 'currency',
      getCurrencyOptions(currencyISOCode)
    );

    return formattedValue;
  }

  getVisibility(config): boolean {
    const { visibility = true } = config;

    return this.utils.getBooleanValue(visibility);
  }
}
