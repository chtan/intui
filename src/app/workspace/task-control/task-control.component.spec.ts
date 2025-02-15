import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskControlComponent } from './task-control.component';

describe('TaskControlComponent', () => {
  let component: TaskControlComponent;
  let fixture: ComponentFixture<TaskControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
