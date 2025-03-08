import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotsPageComponent } from './bots-page.component';

describe('BotsPageComponent', () => {
  let component: BotsPageComponent;
  let fixture: ComponentFixture<BotsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
