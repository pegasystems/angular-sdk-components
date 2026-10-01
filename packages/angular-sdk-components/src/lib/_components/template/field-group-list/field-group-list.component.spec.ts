import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldGroupListComponent } from './field-group-list.component';

// TODO: needs engine-level PConnect/PCore fixtures beyond the shared lenient mocks in test-setup.ts
xdescribe('FieldGroupListComponent', () => {
  let component: FieldGroupListComponent;
  let fixture: ComponentFixture<FieldGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldGroupListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FieldGroupListComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
