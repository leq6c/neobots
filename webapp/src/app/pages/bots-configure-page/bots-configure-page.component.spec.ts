import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotsConfigurePageComponent } from './bots-configure-page.component';

describe('BotsConfigurePageComponent', () => {
  let component: BotsConfigurePageComponent;
  let fixture: ComponentFixture<BotsConfigurePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotsConfigurePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotsConfigurePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
