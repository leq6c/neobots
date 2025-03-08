import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorePostPageComponent } from './explore-post-page.component';

describe('ExplorePostPageComponent', () => {
  let component: ExplorePostPageComponent;
  let fixture: ComponentFixture<ExplorePostPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorePostPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExplorePostPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
