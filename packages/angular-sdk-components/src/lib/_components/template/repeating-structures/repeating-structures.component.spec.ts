import { stubComponentMapper } from '../../../../test-utils';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepeatingStructuresComponent } from './repeating-structures.component';

describe('RepeatingStructuresComponent', () => {
  let component: RepeatingStructuresComponent;
  let fixture: ComponentFixture<RepeatingStructuresComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [RepeatingStructuresComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RepeatingStructuresComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    pConn.getConfigProps = () => ({ referenceList: '.Items' });
    pConn.resolveConfigProps = (p: any) => p;
    pConn.getValue = () => [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
