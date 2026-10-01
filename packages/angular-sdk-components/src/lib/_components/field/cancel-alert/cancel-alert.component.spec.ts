import { vi } from 'vitest';
import { createMockPConn } from '../../../../test-setup';
import { getMappedComponents, stubComponentMapper } from '../../../../test-utils';
import { ProgressSpinnerService } from '../../../_messages/progress-spinner.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelAlertComponent } from './cancel-alert.component';

describe('CancelAlertComponent', () => {
  let component: CancelAlertComponent;
  let fixture: ComponentFixture<CancelAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelAlertComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelAlertComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('CancelAlertComponent behaviour', () => {
  let fixture: ComponentFixture<CancelAlertComponent>;
  let component: CancelAlertComponent;
  let pConn: any;
  let spinner: { sendMessage: any };
  let api: any;
  let containerManager: any;
  let emitted: boolean[];

  const flush = async () => {
    for (let i = 0; i < 5; i++) await Promise.resolve();
  };

  beforeEach(async () => {
    spinner = { sendMessage: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [CancelAlertComponent],
      providers: [{ provide: ProgressSpinnerService, useValue: spinner }]
    }).compileComponents();
    await stubComponentMapper();

    api = {
      deleteCaseInCreateStage: vi.fn().mockResolvedValue(undefined),
      cancelAssignment: vi.fn(),
      cancelBulkAction: vi.fn()
    };
    containerManager = { removeContainerItem: vi.fn() };
    pConn = createMockPConn();
    pConn.getContextName = () => 'app/primary_2';
    pConn.getActionsApi = () => api;
    pConn.getContainerManager = () => containerManager;
    pConn.getValue = () => false;

    fixture = TestBed.createComponent(CancelAlertComponent);
    component = fixture.componentInstance;
    component.pConn$ = pConn;
    emitted = [];
    component.onAlertState$.subscribe((v: boolean) => emitted.push(v));
  });

  function show() {
    component.bShowAlert$ = true;
    component.ngOnChanges();
    fixture.detectChanges();
  }

  it('renders nothing while the alert is hidden', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.psdk-cancel-alert-background')).toBeNull();
  });

  it('shows the alert text, hides the spinner and passes Discard / Go back buttons to ActionButtons', async () => {
    show();
    expect(fixture.nativeElement.querySelector('h3').textContent).toContain('Discard unsaved changes?');
    expect(fixture.nativeElement.textContent).toContain('You have unsaved changes');
    expect(spinner.sendMessage).toHaveBeenCalledWith(false);
    expect(component.itemKey).toBe('app/primary_2');
    const mapped = await getMappedComponents(fixture);
    expect(mapped.map(m => m.name)).toEqual(['ActionButtons']);
    expect(mapped[0].props.arMainButtons$[0]).toMatchObject({ actionID: 'discard', name: 'Discard' });
    expect(mapped[0].props.arSecondaryButtons$[0]).toMatchObject({ actionID: 'continue', name: 'Go back' });
  });

  it('go back dismisses the alert and emits false', () => {
    show();
    component.buttonClick({ action: 'continue' });
    expect(component.bShowAlert$).toBe(false);
    expect(emitted).toEqual([false]);
  });

  it('ignores unknown actions', () => {
    show();
    component.buttonClick({ action: 'other' });
    expect(emitted).toEqual([]);
    expect(api.deleteCaseInCreateStage).not.toHaveBeenCalled();
  });

  it('discard deletes the case in create stage, then dismisses and publishes the cancel event', async () => {
    component.hideDelete = true;
    show();
    const publish = vi.fn();
    (globalThis as any).PCore.getPubSubUtils = () => ({ publish });
    component.buttonClick({ action: 'discard' });
    expect(spinner.sendMessage).toHaveBeenCalledWith(true);
    expect(api.deleteCaseInCreateStage).toHaveBeenCalledWith('app/primary_2', true);
    await flush();
    expect(emitted).toEqual([true]);
    expect(publish).toHaveBeenCalledTimes(1);
  });

  it('alerts when deleting the case fails and does not dismiss', async () => {
    show();
    api.deleteCaseInCreateStage.mockRejectedValue(new Error('x'));
    const alertSpy = vi.spyOn(globalThis as any, 'alert').mockImplementation(() => undefined);
    component.buttonClick({ action: 'discard' });
    await flush();
    expect(alertSpy).toHaveBeenCalledWith('Delete failed.');
    expect(emitted).toEqual([]);
  });

  it('discard of a local action cancels the assignment', () => {
    show();
    pConn.getValue = () => true;
    component.handleDiscard();
    expect(api.cancelAssignment).toHaveBeenCalledWith('app/primary_2', false);
    expect(api.deleteCaseInCreateStage).not.toHaveBeenCalled();
    expect(emitted).toEqual([true]);
  });

  it('discard of a bulk action cancels the bulk action', () => {
    show();
    pConn.options = { isBulkAction: true };
    component.handleDiscard();
    expect(api.cancelBulkAction).toHaveBeenCalledWith('app/primary_2');
    expect(emitted).toEqual([true]);
  });

  it('discard of a data object removes the container item', () => {
    component.isDataObject = true;
    component.skipReleaseLockRequest = true;
    show();
    component.handleDiscard();
    expect(containerManager.removeContainerItem).toHaveBeenCalledWith({ containerItemID: 'app/primary_2', skipReleaseLockRequest: true });
    expect(api.deleteCaseInCreateStage).not.toHaveBeenCalled();
    expect(emitted).toEqual([true]);
  });
});
