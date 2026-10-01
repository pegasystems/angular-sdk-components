import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialVerticalTabsComponent } from './material-vertical-tabs.component';

describe('MaterialVerticalTabsComponent', () => {
  let component: MaterialVerticalTabsComponent;
  let fixture: ComponentFixture<MaterialVerticalTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialVerticalTabsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialVerticalTabsComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
