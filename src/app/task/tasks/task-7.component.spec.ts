import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Task7Component } from './task-7.component';

describe('Task7Component', () => {
  let component: Task7Component;
  let fixture: ComponentFixture<Task7Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Task7Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Task7Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
