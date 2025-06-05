import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Task10Component } from './task-10.component';

describe('Task-9Component', () => {
  let component: Task10Component;
  let fixture: ComponentFixture<Task10Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Task10Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Task10Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
