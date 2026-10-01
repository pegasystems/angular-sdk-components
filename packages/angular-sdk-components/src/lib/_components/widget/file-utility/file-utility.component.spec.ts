import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUtilityComponent } from './file-utility.component';

describe('FileUtilityComponent', () => {
  let component: FileUtilityComponent;
  let fixture: ComponentFixture<FileUtilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUtilityComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUtilityComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
