// Ensure PCore is defined before component module loads
if (typeof (globalThis as any).PCore === 'undefined') {
  (globalThis as any).PCore = {
    getLocaleUtils: () => ({
      getLocaleValue: (value: string) => value
    })
  };
}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { ListViewActionButtonsComponent } from './list-view-action-buttons.component';

describe('ListViewActionButtonsComponent', () => {
  setupTestBed({ zoneless: false });

  let component: ListViewActionButtonsComponent;
  let fixture: ComponentFixture<ListViewActionButtonsComponent>;
  let mockPConn: any;

  beforeEach(async () => {
    mockPConn = {
      getActionsApi: vi.fn().mockReturnValue({
        cancelDataObject: vi.fn(),
        submitEmbeddedDataModal: vi.fn().mockResolvedValue(undefined)
      })
    };

    await TestBed.configureTestingModule({
      imports: [ListViewActionButtonsComponent, NoopAnimationsModule, MatButtonModule, MatGridListModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ListViewActionButtonsComponent);
    component = fixture.componentInstance;
    component.pConn$ = mockPConn;
    component.context$ = 'testContext';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onCancel', () => {
    it('should emit closeActionsDialog event', () => {
      const emitSpy = vi.spyOn(component.closeActionsDialog, 'emit');
      component.onCancel();
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should call cancelDataObject with context', () => {
      component.onCancel();
      expect(mockPConn.getActionsApi().cancelDataObject).toHaveBeenCalledWith('testContext');
    });
  });

  describe('onSubmit', () => {
    it('should set isDisabled to true initially', () => {
      component.onSubmit();
      expect(component.isDisabled).toBe(true);
    });

    it('should call submitEmbeddedDataModal with context', () => {
      component.onSubmit();
      expect(mockPConn.getActionsApi().submitEmbeddedDataModal).toHaveBeenCalledWith('testContext');
    });
  });
});
