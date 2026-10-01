import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiReferenceReadonlyComponent } from './multi-reference-readonly.component';

// TODO: needs engine-level PConnect/PCore fixtures beyond the shared lenient mocks in test-setup.ts
xdescribe('MultiReferenceReadonlyComponent', () => {
  let component: MultiReferenceReadonlyComponent;
  let fixture: ComponentFixture<MultiReferenceReadonlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiReferenceReadonlyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MultiReferenceReadonlyComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
