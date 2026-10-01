import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';

import { createMockPConn } from '../../../../../test-setup';
import { stubComponentMapper } from '../../../../../test-utils';
import { SearchGroupsComponent } from './search-groups.component';

describe('SearchGroupsComponent', () => {
  let fixture: ComponentFixture<SearchGroupsComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [SearchGroupsComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(SearchGroupsComponent);
    (fixture.componentInstance as any).pConn$ = createMockPConn();
    (fixture.componentInstance as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
