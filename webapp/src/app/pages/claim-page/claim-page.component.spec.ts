import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimPageComponent } from './claim-page.component';

describe('ClaimPageComponent', () => {
  let component: ClaimPageComponent;
  let fixture: ComponentFixture<ClaimPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
