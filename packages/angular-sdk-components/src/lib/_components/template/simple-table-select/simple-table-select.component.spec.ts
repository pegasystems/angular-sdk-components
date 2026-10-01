import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleTableSelectComponent } from './simple-table-select.component';

// TODO: needs engine-level PConnect/PCore fixtures beyond the shared lenient mocks in test-setup.ts
xdescribe('SimpleTableSelectComponent', () => {
  let component: SimpleTableSelectComponent;
  let fixture: ComponentFixture<SimpleTableSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleTableSelectComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleTableSelectComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
