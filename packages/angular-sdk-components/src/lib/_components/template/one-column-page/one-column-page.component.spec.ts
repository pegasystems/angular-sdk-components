import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneColumnPageComponent } from './one-column-page.component';

describe('OneColumnPageComponent', () => {
  let component: OneColumnPageComponent;
  let fixture: ComponentFixture<OneColumnPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OneColumnPageComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OneColumnPageComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
