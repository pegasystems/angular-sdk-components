import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IntegerComponent } from './integer.component';

describe('IntegerComponent', () => {
  let component: IntegerComponent;
  let fixture: ComponentFixture<IntegerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IntegerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
