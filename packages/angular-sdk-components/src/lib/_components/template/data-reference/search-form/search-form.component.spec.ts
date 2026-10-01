import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';

import { createMockChild, createMockPConn } from '../../../../../test-setup';
import { stubComponentMapper } from '../../../../../test-utils';
import { SearchFormComponent } from './search-form.component';

describe('SearchFormComponent', () => {
  let fixture: ComponentFixture<SearchFormComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [SearchFormComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(SearchFormComponent);
    const pConn = createMockPConn();
    pConn.getChildren = () => [createMockChild(), createMockChild(), createMockChild({ getChildren: () => [] })];
    (fixture.componentInstance as any).pConn$ = pConn;
    (fixture.componentInstance as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
