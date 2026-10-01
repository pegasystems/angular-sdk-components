import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TestBed } from '@angular/core/testing';

import { createMockPConn, getA11yViolations } from '../../../test-setup';
import { TextInputComponent } from './text-input/text-input.component';
import { TextAreaComponent } from './text-area/text-area.component';
import { EmailComponent } from './email/email.component';
import { IntegerComponent } from './integer/integer.component';
import { CheckBoxComponent } from './check-box/check-box.component';
import { UrlComponent } from './url/url.component';
import { TimeComponent } from './time/time.component';
import { DecimalComponent } from './decimal/decimal.component';
import { PercentageComponent } from './percentage/percentage.component';
import { CurrencyComponent } from './currency/currency.component';
import { DateComponent } from './date/date.component';
import { RadioButtonsComponent } from './radio-buttons/radio-buttons.component';

function createHost(selector: string, component: any, configProps: Record<string, unknown>) {
  const pConn = createMockPConn();
  pConn.getConfigProps = () => configProps;
  pConn.resolveConfigProps = (p: any) => p;

  const template = `<${selector} [pConn$]="pConn" [formGroup$]="formGroup"></${selector}>`;

  @Component({ imports: [component], template })
  class HostComponent {
    pConn = pConn;
    formGroup = new FormGroup({});
  }
  return HostComponent;
}

describe('Field accessibility (axe-core, WCAG 2.1 A/AA)', () => {
  const cases: [string, string, any][] = [
    ['TextInput', 'app-text-input', TextInputComponent],
    ['TextArea', 'app-text-area', TextAreaComponent],
    ['Email', 'app-email', EmailComponent],
    ['Integer', 'app-integer', IntegerComponent],
    ['CheckBox', 'app-check-box', CheckBoxComponent],
    ['Url', 'app-url', UrlComponent],
    ['Time', 'app-time', TimeComponent],
    ['Decimal', 'app-decimal', DecimalComponent],
    ['Percentage', 'app-percentage', PercentageComponent],
    ['Currency', 'app-currency', CurrencyComponent],
    ['Date', 'app-date', DateComponent],
    ['RadioButtons', 'app-radio-buttons', RadioButtonsComponent]
  ];

  cases.forEach(([name, selector, component]) => {
    it(`${name} has no detectable violations when editable`, async () => {
      const Host = createHost(selector, component, { label: `${name} label`, caption: `${name} caption`, testId: 'f1', required: true });
      TestBed.configureTestingModule({ imports: [Host] });
      const fx = TestBed.createComponent(Host);
      fx.detectChanges();
      await fx.whenStable();

      expect(await getA11yViolations(fx.nativeElement)).toEqual([]);
    });
  });
});
