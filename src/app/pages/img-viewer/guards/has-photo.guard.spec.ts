import { TestBed } from '@angular/core/testing';

import { HasPhotoGuard } from './has-photo.guard';

describe('HasPhotoGuard', () => {
  let guard: HasPhotoGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(HasPhotoGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
