import { stubComponentMapper } from '../../../../test-utils';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleTableSelectComponent } from './simple-table-select.component';

describe('SimpleTableSelectComponent', () => {
  let component: SimpleTableSelectComponent;
  let fixture: ComponentFixture<SimpleTableSelectComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [SimpleTableSelectComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleTableSelectComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    pConn.getFieldMetadata = () => ({});
    pConn.getCurrentPageFieldMetadata = () => ({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
