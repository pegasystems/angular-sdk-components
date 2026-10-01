import { stubComponentMapper } from '../../../../test-utils';
import { createMockChild, createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiReferenceReadonlyComponent } from './multi-reference-readonly.component';

describe('MultiReferenceReadonlyComponent', () => {
  let component: MultiReferenceReadonlyComponent;
  let fixture: ComponentFixture<MultiReferenceReadonlyComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [MultiReferenceReadonlyComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(MultiReferenceReadonlyComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    pConn.getMetadata = () => ({ config: { referenceList: '.Items', readonlyContextList: '.Items' } });
    pConn.getConfigProps = () => ({ label: 'Items' });
    pConn.createComponent = () => createMockChild();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
