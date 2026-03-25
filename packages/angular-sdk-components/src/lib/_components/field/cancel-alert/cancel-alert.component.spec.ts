import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { CancelAlertComponent } from './cancel-alert.component';
import { ProgressSpinnerService } from '../../../_messages/progress-spinner.service';

// Mock PCore global
const mockPCore = {
  getLocaleUtils: vi.fn().mockReturnValue({
    getLocaleValue: vi.fn().mockImplementation(text => text)
  }),
  getPubSubUtils: vi.fn().mockReturnValue({
    publish: vi.fn()
  }),
  getConstants: vi.fn().mockReturnValue({
    PUB_SUB_EVENTS: {
      EVENT_CANCEL: 'cancelEvent'
    }
  })
};

(globalThis as any).PCore = mockPCore;

describe('CancelAlertComponent', () => {
  setupTestBed({ zoneless: false });

  let component: CancelAlertComponent;
  let fixture: ComponentFixture<CancelAlertComponent>;
  let mockProgressSpinnerService: { sendMessage: any };
  let mockPConn: any;

  beforeEach(async () => {
    mockProgressSpinnerService = {
      sendMessage: vi.fn()
    };

    mockPConn = {
      getContextName: vi.fn().mockReturnValue('app/primary_1'),
      getLocalizedValue: vi.fn().mockImplementation(text => text),
      getActionsApi: vi.fn().mockReturnValue({
        cancelAssignment: vi.fn(),
        deleteCaseInCreateStage: vi.fn().mockResolvedValue({})
      })
    };

    await TestBed.configureTestingModule({
      imports: [CancelAlertComponent, NoopAnimationsModule, MatButtonModule, MatGridListModule],
      providers: [{ provide: ProgressSpinnerService, useValue: mockProgressSpinnerService }]
    }).compileComponents();

    fixture = TestBed.createComponent(CancelAlertComponent);
    component = fixture.componentInstance;
    component.pConn$ = mockPConn;
    component.bShowAlert$ = false;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should setup cancel alert when bShowAlert$ is true', () => {
      component.bShowAlert$ = true;
      component.ngOnChanges();
      expect(mockProgressSpinnerService.sendMessage).toHaveBeenCalledWith(false);
      expect(component.itemKey).toBe('app/primary_1');
    });

    it('should create cancel alert buttons', () => {
      component.bShowAlert$ = true;
      component.ngOnChanges();
      expect(component.discardButton).toBeDefined();
      expect(component.goBackButton).toBeDefined();
    });

    it('should not setup when bShowAlert$ is false', () => {
      component.bShowAlert$ = false;
      component.ngOnChanges();
      expect(component.itemKey).toBeUndefined();
    });
  });

  describe('dismissAlertOnly', () => {
    it('should set bShowAlert$ to false', () => {
      component.bShowAlert$ = true;
      component.dismissAlertOnly();
      expect(component.bShowAlert$).toBe(false);
    });

    it('should emit false on onAlertState$', () => {
      const emitSpy = vi.spyOn(component.onAlertState$, 'emit');
      component.dismissAlertOnly();
      expect(emitSpy).toHaveBeenCalledWith(false);
    });
  });

  describe('dismissAlert', () => {
    it('should set bShowAlert$ to false', () => {
      component.bShowAlert$ = true;
      component.dismissAlert();
      expect(component.bShowAlert$).toBe(false);
    });

    it('should emit true on onAlertState$', () => {
      const emitSpy = vi.spyOn(component.onAlertState$, 'emit');
      component.dismissAlert();
      expect(emitSpy).toHaveBeenCalledWith(true);
    });
  });

  describe('createCancelAlertButtons', () => {
    it('should create discard button with correct properties', () => {
      component.createCancelAlertButtons();
      expect(component.discardButton).toEqual({
        actionID: 'discard',
        jsAction: 'discard',
        name: 'Discard'
      });
    });

    it('should create go back button with correct properties', () => {
      component.createCancelAlertButtons();
      expect(component.goBackButton).toEqual({
        actionID: 'continue',
        jsAction: 'continue',
        name: 'Go back'
      });
    });
  });

  describe('buttonClick', () => {
    beforeEach(() => {
      component.bShowAlert$ = true;
      component.ngOnChanges();
    });

    it('should call dismissAlertOnly when action is continue', () => {
      const dismissSpy = vi.spyOn(component, 'dismissAlertOnly');
      component.buttonClick({ action: 'continue' });
      expect(dismissSpy).toHaveBeenCalled();
    });

    it('should show progress spinner when action is discard', async () => {
      component.buttonClick({ action: 'discard' });
      expect(mockProgressSpinnerService.sendMessage).toHaveBeenCalledWith(true);
    });

    it('should call deleteCaseInCreateStage when action is discard', async () => {
      const actionsApi = mockPConn.getActionsApi();
      component.buttonClick({ action: 'discard' });
      expect(actionsApi.deleteCaseInCreateStage).toHaveBeenCalledWith('app/primary_1');
    });

    it('should do nothing for unknown action', () => {
      const dismissSpy = vi.spyOn(component, 'dismissAlertOnly');
      component.buttonClick({ action: 'unknown' });
      expect(dismissSpy).not.toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    it('should call alert with the message', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      component.sendMessage('Test message');
      expect(alertSpy).toHaveBeenCalledWith('Test message');
      alertSpy.mockRestore();
    });
  });
});
