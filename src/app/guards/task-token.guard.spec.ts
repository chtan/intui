import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { taskTokenGuard } from './task-token.guard';

describe('taskTokenGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => taskTokenGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
