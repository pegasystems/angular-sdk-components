import { stubComponentMapper } from '../../../../test-utils';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleReferenceReadonlyComponent } from './single-reference-readonly.component';

describe('SingleReferenceReadonlyComponent', () => {
  let component: SingleReferenceReadonlyComponent;
  let fixture: ComponentFixture<SingleReferenceReadonlyComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [SingleReferenceReadonlyComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(SingleReferenceReadonlyComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
