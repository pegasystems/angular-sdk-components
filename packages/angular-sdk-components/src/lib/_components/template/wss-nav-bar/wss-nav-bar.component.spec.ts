import { stubComponentMapper } from '../../../../test-utils';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WssNavBarComponent } from './wss-nav-bar.component';

describe('WssNavBarComponent', () => {
  let component: WssNavBarComponent;
  let fixture: ComponentFixture<WssNavBarComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [WssNavBarComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(WssNavBarComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    (component as any).pages$ = [{ pxPageViewIcon: 'pi pi-home', pyClassName: 'A', pyLabel: 'Home', pyRuleName: 'Home' }];
    (component as any).caseTypes$ = [];
    (component as any).appName$ = 'App';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
