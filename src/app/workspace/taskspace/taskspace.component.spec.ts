import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskspaceComponent } from './taskspace.component';

describe('TaskspaceComponent', () => {
  let component: TaskspaceComponent;
  let fixture: ComponentFixture<TaskspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskspaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
