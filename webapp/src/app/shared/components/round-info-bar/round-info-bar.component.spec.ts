import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundInfoBarComponent } from './round-info-bar.component';

describe('RoundInfoBarComponent', () => {
  let component: RoundInfoBarComponent;
  let fixture: ComponentFixture<RoundInfoBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundInfoBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoundInfoBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
