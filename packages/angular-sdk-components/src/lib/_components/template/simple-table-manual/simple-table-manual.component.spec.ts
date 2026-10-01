import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleTableManualComponent } from './simple-table-manual.component';

describe('SimpleTableManualComponent', () => {
  let component: SimpleTableManualComponent;
  let fixture: ComponentFixture<SimpleTableManualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleTableManualComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleTableManualComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
