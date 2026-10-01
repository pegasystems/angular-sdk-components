import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsTwoColumnComponent } from './details-two-column.component';

describe('DetailsTwoColumnComponent', () => {
  let component: DetailsTwoColumnComponent;
  let fixture: ComponentFixture<DetailsTwoColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsTwoColumnComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsTwoColumnComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
