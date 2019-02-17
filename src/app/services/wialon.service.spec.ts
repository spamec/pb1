import { TestBed } from '@angular/core/testing';

import { WialonService } from './wialon.service';

describe('WialonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WialonService = TestBed.get(WialonService);
    expect(service).toBeTruthy();
  });
});
