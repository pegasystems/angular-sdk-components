import { FormGroup } from '@angular/forms';
import { getMappedComponents, stubComponentMapper } from '../../../../test-utils';
import { createMockChild, createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineDashboardComponent } from './inline-dashboard.component';

describe('InlineDashboardComponent', () => {
  let component: InlineDashboardComponent;
  let fixture: ComponentFixture<InlineDashboardComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [InlineDashboardComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineDashboardComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    (component as any).children = [createMockChild(), createMockChild()];
    (component as any).inlineProps = { title: 'Dashboard', filterPosition: 'block-start' };
    (component as any).filtersFormGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the title and maps the filter and list regions', async () => {
    expect(fixture.nativeElement.querySelector('.psdk-inline-dashboard-title')?.textContent).toContain('Dashboard');
    expect((await getMappedComponents(fixture)).map(m => m.name)).toEqual(['DashboardFilter', 'Region']);
  });
});
