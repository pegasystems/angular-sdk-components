import { stubComponentMapper } from '../../../../test-utils';
import { createMockChild, createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldGroupListComponent } from './field-group-list.component';

describe('FieldGroupListComponent', () => {
  let component: FieldGroupListComponent;
  let fixture: ComponentFixture<FieldGroupListComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [FieldGroupListComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(FieldGroupListComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    (component as any).item = { children: createMockChild() };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
