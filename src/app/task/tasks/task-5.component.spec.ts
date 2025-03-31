import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Task5Component } from './task-5.component';

describe('Task5Component', () => {
  let component: Task5Component;
  let fixture: ComponentFixture<Task5Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Task5Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Task5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
