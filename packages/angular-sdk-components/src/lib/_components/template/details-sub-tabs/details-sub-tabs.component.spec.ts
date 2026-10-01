import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsSubTabsComponent } from './details-sub-tabs.component';

describe('DetailsSubTabsComponent', () => {
  let component: DetailsSubTabsComponent;
  let fixture: ComponentFixture<DetailsSubTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsSubTabsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsSubTabsComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
