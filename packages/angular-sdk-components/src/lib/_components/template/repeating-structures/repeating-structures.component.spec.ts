import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepeatingStructuresComponent } from './repeating-structures.component';

// TODO: needs engine-level PConnect/PCore fixtures beyond the shared lenient mocks in test-setup.ts
xdescribe('RepeatingStructuresComponent', () => {
  let component: RepeatingStructuresComponent;
  let fixture: ComponentFixture<RepeatingStructuresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepeatingStructuresComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RepeatingStructuresComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
