import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataReferenceComponent } from './data-reference.component';

// TODO: needs engine-level PConnect/PCore fixtures beyond the shared lenient mocks in test-setup.ts
xdescribe('DataReferenceComponent', () => {
  let component: DataReferenceComponent;
  let fixture: ComponentFixture<DataReferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataReferenceComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataReferenceComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
