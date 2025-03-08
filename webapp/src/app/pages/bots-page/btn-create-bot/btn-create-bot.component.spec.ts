import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnCreateBotComponent } from './btn-create-bot.component';

describe('BtnCreateBotComponent', () => {
  let component: BtnCreateBotComponent;
  let fixture: ComponentFixture<BtnCreateBotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnCreateBotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnCreateBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
