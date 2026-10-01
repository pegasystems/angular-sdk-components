import { stubComponentMapper } from '../../../../test-utils';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [NavbarComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
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

  it('reuses the nav page views when the pages are refreshed, so a refresh during change detection cannot trigger NG0100', () => {
    // A store callback can fire while Angular is checking the view tree (for example from a child's ngOnInit).
    // updateSelf() rebuilds navPages$ with new object identities; tracking by reference then recreated the views after
    // they had been checked, which surfaced as NG0100 (ExpressionChangedAfterItHasBeenChecked) on the icon src.
    const pageIcon = () => fixture.nativeElement.querySelector('img[src$="home.svg"]') as HTMLImageElement;
    const before = pageIcon();
    expect(before).toBeTruthy();

    component.updateSelf();
    fixture.detectChanges();

    expect(pageIcon()).toBe(before);
  });
});
