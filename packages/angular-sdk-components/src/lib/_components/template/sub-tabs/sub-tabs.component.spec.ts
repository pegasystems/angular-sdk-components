import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubTabsComponent } from './sub-tabs.component';

describe('SubTabsComponent', () => {
  let component: SubTabsComponent;
  let fixture: ComponentFixture<SubTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubTabsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubTabsComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
