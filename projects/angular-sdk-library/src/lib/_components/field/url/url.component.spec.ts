import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UrlComponent } from './url.component';

describe('UrlComponent', () => {
  let component: UrlComponent;
  let fixture: ComponentFixture<UrlComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UrlComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
