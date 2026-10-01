import { getMappedComponents, stubComponentMapper } from '../../../../test-utils';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectPageComponent } from './object-page.component';

describe('ObjectPageComponent', () => {
  let component: ObjectPageComponent;
  let fixture: ComponentFixture<ObjectPageComponent>;
  let pConn: any;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [ObjectPageComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(ObjectPageComponent);
    component = fixture.componentInstance;
    pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('delegates rendering to the CaseView component with its own PConnect', async () => {
    expect(await getMappedComponents(fixture)).toEqual([{ name: 'CaseView', props: jasmine.objectContaining({ pConn$: pConn }) }]);
  });
});
