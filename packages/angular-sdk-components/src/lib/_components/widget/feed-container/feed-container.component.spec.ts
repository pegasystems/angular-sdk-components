import { stubComponentMapper } from '../../../../test-utils';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedContainerComponent } from './feed-container.component';

describe('FeedContainerComponent', () => {
  let component: FeedContainerComponent;
  let fixture: ComponentFixture<FeedContainerComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [FeedContainerComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedContainerComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
