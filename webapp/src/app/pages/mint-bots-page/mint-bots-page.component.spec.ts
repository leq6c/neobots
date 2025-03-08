import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MintBotsPageComponent } from './mint-bots-page.component';

describe('MintBotsPageComponent', () => {
  let component: MintBotsPageComponent;
  let fixture: ComponentFixture<MintBotsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MintBotsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MintBotsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
