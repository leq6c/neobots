import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotsPageV2Component } from './bots-page-v2.component';

describe('BotsPageV2Component', () => {
  let component: BotsPageV2Component;
  let fixture: ComponentFixture<BotsPageV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotsPageV2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotsPageV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
