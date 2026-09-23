import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { ModalViewContainerComponent } from './modal-view-container.component';

describe('ModalViewContainerComponent', () => {
  let component: ModalViewContainerComponent;
  let markForCheckSpy: jasmine.Spy;

  beforeEach(() => {
    (globalThis as any).PCore = {
      getConstants: () => ({ PAGE: 'PAGE' })
    };

    markForCheckSpy = jasmine.createSpy('markForCheck');
    const cdRef = { markForCheck: markForCheckSpy } as unknown as ChangeDetectorRef;

    component = new ModalViewContainerComponent({} as any, cdRef, {} as any, new FormBuilder());
    component.pConn$ = { getStateProps: () => ({}) } as any;
    component.itemKey$ = 'app/modal_1';
    component.stateProps$ = {};
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('surfaces httpMessages captured by the bridge as an urgent banner', () => {
    component.angularPConnectData.httpMessages = ['Save failed'];

    const banners = component.getBanners();

    expect(banners.length).toBe(1);
    expect(banners[0].messages).toEqual(['Save failed']);
    expect(banners[0].variant).toBe('urgent');
  });

  it('produces no banner when there are no httpMessages', () => {
    component.angularPConnectData.httpMessages = undefined;

    expect(component.getBanners()).toEqual([]);
  });

  it('refreshes banners and flags change detection when they change', () => {
    component.angularPConnectData.httpMessages = ['Save failed'];

    component.refreshBanners();

    expect(component.banners.length).toBe(1);
    expect(markForCheckSpy).toHaveBeenCalled();
  });

  it('does not flag change detection when the banners are unchanged', () => {
    component.banners = component.getBanners();
    markForCheckSpy.calls.reset();

    component.refreshBanners();

    expect(markForCheckSpy).not.toHaveBeenCalled();
  });
});
