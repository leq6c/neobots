import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinimalChartComponent } from './minimal-chart.component';

describe('MinimalChartComponent', () => {
  let component: MinimalChartComponent;
  let fixture: ComponentFixture<MinimalChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinimalChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinimalChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
