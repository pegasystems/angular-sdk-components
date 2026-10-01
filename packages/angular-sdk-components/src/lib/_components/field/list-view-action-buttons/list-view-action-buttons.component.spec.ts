import { vi } from 'vitest';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListViewActionButtonsComponent } from './list-view-action-buttons.component';

describe('ListViewActionButtonsComponent', () => {
  let component: ListViewActionButtonsComponent;
  let fixture: ComponentFixture<ListViewActionButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListViewActionButtonsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ListViewActionButtonsComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function setup(actions: Record<string, any>) {
    const pConn = createMockPConn();
    pConn.getActionsApi = () => actions;
    const fx = TestBed.createComponent(ListViewActionButtonsComponent);
    fx.componentInstance.pConn$ = pConn;
    fx.componentInstance.context$ = 'ctx-1';
    fx.detectChanges();
    return { fx, comp: fx.componentInstance, el: fx.nativeElement as HTMLElement };
  }

  it('renders Cancel and Submit buttons', () => {
    const { el } = setup({});
    const buttons = Array.from(el.querySelectorAll('button')).map(b => b.textContent?.trim());
    expect(buttons).toEqual(['Cancel', 'Submit']);
  });

  it('Cancel emits closeActionsDialog and cancels the data object for the context', () => {
    const cancelDataObject = vi.fn();
    const { comp, el } = setup({ cancelDataObject });
    const closed = vi.fn();
    comp.closeActionsDialog.subscribe(closed);
    (el.querySelectorAll('button')[0] as HTMLButtonElement).click();
    expect(closed).toHaveBeenCalledTimes(1);
    expect(cancelDataObject).toHaveBeenCalledWith('ctx-1');
  });

  it('Submit disables the button while pending, then closes and re-enables on success', async () => {
    let resolve!: () => void;
    const submitEmbeddedDataModal = vi.fn().mockReturnValue(new Promise<void>(r => (resolve = r)));
    const { comp, fx, el } = setup({ submitEmbeddedDataModal });
    const closed = vi.fn();
    comp.closeActionsDialog.subscribe(closed);
    const submit = el.querySelectorAll('button')[1] as HTMLButtonElement;
    submit.click();
    fx.detectChanges();
    expect(submitEmbeddedDataModal).toHaveBeenCalledWith('ctx-1');
    expect(comp.isDisabled).toBe(true);
    expect(submit.disabled).toBe(true);
    expect(closed).not.toHaveBeenCalled();
    resolve();
    await vi.waitFor(() => expect(comp.isDisabled).toBe(false));
    expect(closed).toHaveBeenCalledTimes(1);
  });
});
