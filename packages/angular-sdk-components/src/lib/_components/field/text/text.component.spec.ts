import { vi } from 'vitest';
import { createMockPConn } from '../../../../test-setup';
import { getMappedComponents, stubComponentMapper } from '../../../../test-utils';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextComponent } from './text.component';
import { Utils } from '../../../_helpers/utils';

describe('TextComponent', () => {
  let component: TextComponent;
  let fixture: ComponentFixture<TextComponent>;

  function create(config: Record<string, any>, formatAs?: string) {
    fixture = TestBed.createComponent(TextComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    pConn.getConfigProps = () => config;
    pConn.resolveConfigProps = (p: any) => p;
    (component as any).pConn$ = pConn;
    component.formatAs$ = formatAs as string;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await stubComponentMapper();
    await TestBed.configureTestingModule({
      imports: [TextComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('maps label, value, displayMode and visibility from configProps', () => {
    create({ label: 'Name', value: 'Bob', displayMode: '', visibility: true }, 'text');
    expect(component.label$).toBe('Name');
    expect(component.value$).toBe('Bob');
    expect(component.formattedValue$).toBe('Bob');
    expect(component.bVisible$).toBe(true);
  });

  it('renders the label and text value', () => {
    create({ label: 'Name', value: 'Bob' }, 'text');
    const labels = Array.from(fixture.nativeElement.querySelectorAll('label')).map((l: any) => l.textContent.trim());
    expect(labels).toEqual(['Name', 'Bob']);
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
  });

  it('keeps the previous value when value is undefined', () => {
    create({ label: 'Name' }, 'text');
    expect(component.value$).toBe('');
  });

  it('hides content when visibility is false', () => {
    create({ label: 'Name', value: 'Bob', visibility: false }, 'text');
    expect(component.bVisible$).toBe(false);
    expect(fixture.nativeElement.textContent).not.toContain('Bob');
  });

  it('renders FieldValueList via component-mapper in display mode', async () => {
    create({ label: 'Name', value: 'Bob', displayMode: 'DISPLAY_ONLY' }, 'text');
    const mapped = await getMappedComponents(fixture);
    expect(mapped.map(m => m.name)).toEqual(['FieldValueList']);
    expect(mapped[0].props).toEqual({ label$: 'Name', value$: 'Bob', displayMode$: 'DISPLAY_ONLY' });
    expect(fixture.nativeElement.querySelector('.psdk-label-infix-readonly')).toBeNull();
  });

  it('renders nothing in display mode when invisible', async () => {
    create({ label: 'Name', displayMode: 'DISPLAY_ONLY', visibility: false }, 'text');
    expect(await getMappedComponents(fixture)).toEqual([]);
  });

  it.each([
    ['https://pega.com', 'https://pega.com'],
    ['http://pega.com', 'http://pega.com'],
    ['pega.com', 'http://pega.com']
  ])('url format: %s becomes link %s', (value, href) => {
    create({ label: 'Site', value }, 'url');
    expect(component.formattedUrl$).toBe(href);
    const a = fixture.nativeElement.querySelector('a');
    expect(a.getAttribute('href')).toBe(href);
    expect(a.textContent).toBe(value);
    expect(fixture.nativeElement.querySelectorAll('.psdk-data-readonly label').length).toBe(0);
  });

  it('time format renders hh:mm A and empty for no value', () => {
    create({ label: 'T', value: '15:05:00' }, 'time');
    expect(component.formattedValue$).toBe('03:05 PM');
    create({ label: 'T' }, 'time');
    expect(component.formattedValue$).toBe('');
  });

  it('date format delegates to Utils.generateDate and is empty without value', () => {
    const utils = TestBed.inject(Utils);
    const spy = vi.spyOn(utils, 'generateDate').mockReturnValue('March 5, 2024');
    create({ label: 'D', value: '2024-03-05' }, 'date');
    expect(spy).toHaveBeenCalledWith('2024-03-05', 'Date-Long-Custom-YYYY');
    expect(component.formattedValue$).toBe('March 5, 2024');
    expect(component.generateDate('')).toBe('');
  });

  it('date-time format uses date formatting for 10 char values and date-time otherwise', () => {
    const utils = TestBed.inject(Utils);
    const dateSpy = vi.spyOn(utils, 'generateDate').mockReturnValue('D');
    const dtSpy = vi.spyOn(utils, 'generateDateTime').mockReturnValue('DT');
    create({ label: 'D', value: '2024-03-05' }, 'date-time');
    expect(component.formattedValue$).toBe('D');
    create({ label: 'D', value: '2024-03-05T10:00:00Z' }, 'date-time');
    expect(component.formattedValue$).toBe('DT');
    expect(dtSpy).toHaveBeenCalledWith('2024-03-05T10:00:00Z', 'DateTime-Long-YYYY-Custom');
    expect(dateSpy).toHaveBeenCalledTimes(1);
    expect(component.generateDateTime('')).toBe('');
  });

  it('unsubscribes from the bridge on destroy', () => {
    create({ label: 'x' }, 'text');
    const spy = vi.fn();
    component.angularPConnectData.unsubscribeFn = spy;
    fixture.destroy();
    expect(spy).toHaveBeenCalled();
  });
});
