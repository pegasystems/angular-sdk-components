import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListUtilityComponent } from './list-utility.component';

describe('ListUtilityComponent', () => {
  let component: ListUtilityComponent;
  let fixture: ComponentFixture<ListUtilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListUtilityComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListUtilityComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
