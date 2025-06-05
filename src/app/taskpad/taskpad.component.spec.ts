import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskpadComponent } from './taskpad.component';

describe('TaskpadComponent', () => {
  let component: TaskpadComponent;
  let fixture: ComponentFixture<TaskpadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskpadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskpadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
