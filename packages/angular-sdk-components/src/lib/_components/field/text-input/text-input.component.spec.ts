import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextInputComponent } from './text-input.component';

describe('TextInputComponent', () => {
  let component: TextInputComponent;
  let fixture: ComponentFixture<TextInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextInputComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextInputComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('reflects store-driven updates while using OnPush', () => {
    // The bridge caches the store on first use, so start from a fresh injector before swapping PCore.getStore.
    TestBed.resetTestingModule();
    let storeListener: () => void = () => undefined;
    (globalThis as any).PCore.getStore = () => ({ getState: () => ({}), subscribe: (cb: () => void) => ((storeListener = cb), () => undefined) });

    const pConn = createMockPConn();
    let label = 'First';
    pConn.getConfigProps = () => ({ label });
    pConn.resolveConfigProps = (p: any) => p;

    // A default-strategy host is needed: ComponentFixture.detectChanges() force-refreshes the OnPush component itself.
    @Component({
      imports: [TextInputComponent],
      template: '<app-text-input [pConn$]="pConn" [formGroup$]="formGroup"></app-text-input>'
    })
    class HostComponent {
      pConn = pConn;
      formGroup = new FormGroup({});
    }

    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fx = TestBed.createComponent(HostComponent);
    fx.detectChanges();
    expect(fx.nativeElement.textContent).toContain('First');

    label = 'Second';
    storeListener();
    fx.detectChanges();
    expect(fx.nativeElement.textContent).toContain('Second');
  });

  it('uses OnPush change detection', () => {
    const def = (TextInputComponent as any).ɵcmp;
    expect(def.onPush).toBe(true);
  });
});
