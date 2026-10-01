import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextContentComponent } from './text-content.component';

describe('TextContentComponent', () => {
  let component: TextContentComponent;
  let fixture: ComponentFixture<TextContentComponent>;

  function create(config: Record<string, any>) {
    fixture = TestBed.createComponent(TextContentComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    pConn.getConfigProps = () => config;
    pConn.resolveConfigProps = (p: any) => p;
    (component as any).pConn$ = pConn;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextContentComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextContentComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updateSelf maps content, displayAs and displayMode', () => {
    create({ content: 'Hello', displayAs: 'Heading 2', displayMode: 'DISPLAY_ONLY' });
    expect(component.content$).toBe('Hello');
    expect(component.displayAs$).toBe('Heading 2');
    expect(component.displayMode$).toBe('DISPLAY_ONLY');
    expect(component.bVisible$).toBe(true);
  });

  it('keeps defaults when content and displayAs are not configured', () => {
    create({});
    expect(component.content$).toBe('');
    expect(component.displayAs$).toBeUndefined();
    expect(fixture.nativeElement.querySelector('.psdk-data-readonly').children.length).toBe(0);
  });

  it.each([
    ['Paragraph', '.mat-subtitle-2'],
    ['Heading 1', '.mat-h1'],
    ['Heading 2', '.mat-h2'],
    ['Heading 3', '.mat-h3'],
    ['Heading 4', '.mat-h4']
  ])('renders %s content in %s', (displayAs, selector) => {
    create({ content: 'Some text', displayAs });
    const nodes = fixture.nativeElement.querySelectorAll('.psdk-data-readonly > div');
    expect(nodes.length).toBe(1);
    expect(nodes[0].matches(selector)).toBe(true);
    expect(nodes[0].textContent).toContain('Some text');
  });

  it.each([[false], ['false']])('renders nothing when visibility is %s', visibility => {
    create({ content: 'Hidden', displayAs: 'Paragraph', visibility });
    expect(component.bVisible$).toBe(false);
    expect(fixture.nativeElement.textContent).not.toContain('Hidden');
  });

  it('unsubscribes from the bridge on destroy', () => {
    create({ content: 'x', displayAs: 'Paragraph' });
    const spy = vi.fn();
    component.angularPConnectData.unsubscribeFn = spy;
    fixture.destroy();
    expect(spy).toHaveBeenCalled();
  });
});
