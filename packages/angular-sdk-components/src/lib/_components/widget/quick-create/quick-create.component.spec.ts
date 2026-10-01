import { stubComponentMapper } from '../../../../test-utils';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickCreateComponent } from './quick-create.component';

describe('QuickCreateComponent', () => {
  let component: QuickCreateComponent;
  let fixture: ComponentFixture<QuickCreateComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [QuickCreateComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(QuickCreateComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
