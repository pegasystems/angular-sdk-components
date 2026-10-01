import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickCreateComponent } from './quick-create.component';

// TODO: needs engine-level PConnect/PCore fixtures beyond the shared lenient mocks in test-setup.ts
xdescribe('QuickCreateComponent', () => {
  let component: QuickCreateComponent;
  let fixture: ComponentFixture<QuickCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickCreateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(QuickCreateComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
