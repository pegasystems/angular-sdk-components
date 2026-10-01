import { stubComponentMapper } from '../../../../test-utils';
import { createMockPConn, createMockChild } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerComponent } from './banner.component';

describe('BannerComponent', () => {
  let component: BannerComponent;
  let fixture: ComponentFixture<BannerComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [BannerComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(BannerComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    (component as any).arChildren$ = [createMockChild(), createMockChild()];
    (component as any).title = 'Welcome';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the title', () => {
    expect(fixture.nativeElement.querySelector('.title')?.textContent).toContain('Welcome');
  });
});
