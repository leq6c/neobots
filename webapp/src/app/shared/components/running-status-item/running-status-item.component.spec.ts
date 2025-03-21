import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunningStatusItemComponent } from './running-status-item.component';

describe('RunningStatusItemComponent', () => {
  let component: RunningStatusItemComponent;
  let fixture: ComponentFixture<RunningStatusItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunningStatusItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunningStatusItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
