import { TestBed } from '@angular/core/testing';

import { Taskshared1Service } from './taskshared1.service';

describe('Taskshared1Service', () => {
  let service: Taskshared1Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Taskshared1Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
