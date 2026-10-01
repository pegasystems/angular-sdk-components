import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WideNarrowFormComponent } from './wide-narrow-form.component';

describe('WideNarrowFormComponent', () => {
  let component: WideNarrowFormComponent;
  let fixture: ComponentFixture<WideNarrowFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WideNarrowFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WideNarrowFormComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
