import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleReferenceReadonlyComponent } from './single-reference-readonly.component';

// TODO: needs engine-level PConnect/PCore fixtures beyond the shared lenient mocks in test-setup.ts
xdescribe('SingleReferenceReadonlyComponent', () => {
  let component: SingleReferenceReadonlyComponent;
  let fixture: ComponentFixture<SingleReferenceReadonlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleReferenceReadonlyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SingleReferenceReadonlyComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
