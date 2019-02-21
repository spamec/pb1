import { TestBed } from '@angular/core/testing';

import { FiltresService } from './filtres.service';

describe('FiltresService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FiltresService = TestBed.get(FiltresService);
    expect(service).toBeTruthy();
  });
});
