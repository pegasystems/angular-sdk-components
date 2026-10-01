import { stubComponentMapper } from '../../../../test-utils';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialUtilityComponent } from './material-utility.component';

describe('MaterialutilityComponent', () => {
  let component: MaterialUtilityComponent;
  let fixture: ComponentFixture<MaterialUtilityComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [MaterialUtilityComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialUtilityComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    (component as any).headerIcon$ = 'plus';
    (component as any).headerText$ = 'Utility';
    (component as any).headerIconUrl$ = '';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
