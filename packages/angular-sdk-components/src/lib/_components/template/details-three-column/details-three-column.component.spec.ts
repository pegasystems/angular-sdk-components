import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsThreeColumnComponent } from './details-three-column.component';

describe('DetailsThreeColumnComponent', () => {
  let component: DetailsThreeColumnComponent;
  let fixture: ComponentFixture<DetailsThreeColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsThreeColumnComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsThreeColumnComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
