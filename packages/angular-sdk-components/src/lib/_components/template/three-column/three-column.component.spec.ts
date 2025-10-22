import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ThreeColumnComponent } from './three-column.component';

describe('ThreeColumnComponent', () => {
  let component: ThreeColumnComponent;
  let fixture: ComponentFixture<ThreeColumnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ThreeColumnComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreeColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
