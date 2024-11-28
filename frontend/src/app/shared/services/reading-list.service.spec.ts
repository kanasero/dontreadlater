import {TestBed} from '@angular/core/testing';

import {ReadingListService} from './reading-list.service';

describe('ReadingListService', () => {
  let service: ReadingListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReadingListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
