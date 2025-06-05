import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Task9Component } from './task-9.component';

describe('Task-9Component', () => {
  let component: Task9Component;
  let fixture: ComponentFixture<Task9Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Task9Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Task9Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
