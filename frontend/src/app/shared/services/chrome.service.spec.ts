import { TestBed } from '@angular/core/testing';

import { ChromeService } from './chrome.service';

describe('ChromeService', () => {
  let service: ChromeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChromeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
