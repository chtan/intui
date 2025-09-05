import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionpadComponent } from './solutionpad.component';

describe('SolutionpadComponent', () => {
  let component: SolutionpadComponent;
  let fixture: ComponentFixture<SolutionpadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolutionpadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolutionpadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
