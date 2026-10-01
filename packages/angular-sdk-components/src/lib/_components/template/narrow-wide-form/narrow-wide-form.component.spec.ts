import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NarrowWideFormComponent } from './narrow-wide-form.component';

describe('NarrowWideFormComponent', () => {
  let component: NarrowWideFormComponent;
  let fixture: ComponentFixture<NarrowWideFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NarrowWideFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NarrowWideFormComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
