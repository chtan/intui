import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoTaskComponent } from './go-task.component';

describe('GoTaskComponent', () => {
  let component: GoTaskComponent;
  let fixture: ComponentFixture<GoTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoTaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
