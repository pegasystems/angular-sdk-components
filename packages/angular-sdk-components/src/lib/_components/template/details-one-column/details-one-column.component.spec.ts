import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsOneColumnComponent } from './details-one-column.component';

describe('DetailsOneColumnComponent', () => {
  let component: DetailsOneColumnComponent;
  let fixture: ComponentFixture<DetailsOneColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsOneColumnComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsOneColumnComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
