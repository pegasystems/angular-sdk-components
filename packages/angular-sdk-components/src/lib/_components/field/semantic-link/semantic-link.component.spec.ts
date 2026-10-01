import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';

import { createMockPConn } from '../../../../test-setup';
import { stubComponentMapper } from '../../../../test-utils';
import { SemanticLinkComponent } from './semantic-link.component';

describe('SemanticLinkComponent', () => {
  let fixture: ComponentFixture<SemanticLinkComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [SemanticLinkComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(SemanticLinkComponent);
    (fixture.componentInstance as any).pConn$ = createMockPConn();
    (fixture.componentInstance as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
