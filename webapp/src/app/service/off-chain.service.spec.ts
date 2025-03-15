import { TestBed } from '@angular/core/testing';

import { OffChainService } from './off-chain.service';

describe('OffChainService', () => {
  let service: OffChainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OffChainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
