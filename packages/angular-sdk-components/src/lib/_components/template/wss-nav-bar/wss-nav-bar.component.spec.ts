import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WssNavBarComponent } from './wss-nav-bar.component';

// TODO: needs engine-level PConnect/PCore fixtures beyond the shared lenient mocks in test-setup.ts
xdescribe('WssNavBarComponent', () => {
  let component: WssNavBarComponent;
  let fixture: ComponentFixture<WssNavBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WssNavBarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(WssNavBarComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
