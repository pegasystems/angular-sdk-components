import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListViewActionButtonsComponent } from './list-view-action-buttons.component';

describe('ListViewActionButtonsComponent', () => {
  let component: ListViewActionButtonsComponent;
  let fixture: ComponentFixture<ListViewActionButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListViewActionButtonsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ListViewActionButtonsComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
