import { TestBed } from '@angular/core/testing';

import { TaskSharedService } from './task-shared.service';

describe('TaskSharedService', () => {
  let service: TaskSharedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskSharedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
