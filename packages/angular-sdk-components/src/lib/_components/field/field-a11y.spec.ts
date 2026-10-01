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

describe('Field accessibility (axe-core, WCAG 2.1 A/AA)', () => {
  const cases: [string, any][] = [
    ['TextInput', TextInputComponent],
    ['TextArea', TextAreaComponent],
    ['Email', EmailComponent],
    ['Integer', IntegerComponent],
    ['CheckBox', CheckBoxComponent],
    ['Url', UrlComponent],
    ['Time', TimeComponent],
    ['Decimal', DecimalComponent],
    ['Percentage', PercentageComponent],
    ['Currency', CurrencyComponent],
    ['Date', DateComponent],
    ['RadioButtons', RadioButtonsComponent]
  ];

  cases.forEach(([name, component]) => {
    it(`${name} has no detectable violations when editable`, async () => {
      TestBed.configureTestingModule({ imports: [component] });
      const fx = TestBed.createComponent(component);
      const pConn = createMockPConn();
      pConn.getConfigProps = () => ({ label: `${name} label`, caption: `${name} caption`, testId: 'f1', required: true });
      pConn.resolveConfigProps = (p: any) => p;
      (fx.componentInstance as any).pConn$ = pConn;
      (fx.componentInstance as any).formGroup$ = new FormGroup({});
      fx.detectChanges();
      await fx.whenStable();

      expect(await getA11yViolations(fx.nativeElement)).toEqual([]);
    });
  });
});
