import { stubComponentMapper } from '../../../../test-utils';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoComponent } from './todo.component';

describe('TodoComponent', () => {
  let component: TodoComponent;
  let fixture: ComponentFixture<TodoComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [TodoComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    pConn.getComponentConfig = () => ({ myWorkList: { fields: [] } });
    pConn.getConfigProps = () => ({ datasource: { source: [] }, showTodoList: true });
    pConn.resolveConfigProps = (p: any) => p;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
