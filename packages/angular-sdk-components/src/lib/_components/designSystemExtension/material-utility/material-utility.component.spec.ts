import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialUtilityComponent } from './material-utility.component';

// TODO: needs engine-level PConnect/PCore fixtures beyond the shared lenient mocks in test-setup.ts
xdescribe('MaterialutilityComponent', () => {
  let component: MaterialUtilityComponent;
  let fixture: ComponentFixture<MaterialUtilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialUtilityComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialUtilityComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
