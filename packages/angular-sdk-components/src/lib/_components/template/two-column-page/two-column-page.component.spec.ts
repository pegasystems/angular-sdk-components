import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoColumnPageComponent } from './two-column-page.component';

describe('TwoColumnPageComponent', () => {
  let component: TwoColumnPageComponent;
  let fixture: ComponentFixture<TwoColumnPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwoColumnPageComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoColumnPageComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
