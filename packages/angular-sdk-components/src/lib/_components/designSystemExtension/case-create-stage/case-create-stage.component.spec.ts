import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseCreateStageComponent } from './case-create-stage.component';

describe('CaseCreateStageComponent', () => {
  let component: CaseCreateStageComponent;
  let fixture: ComponentFixture<CaseCreateStageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseCreateStageComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseCreateStageComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
