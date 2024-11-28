import {SecondsToTimeStringPipe} from './seconds-to-time-string.pipe';

describe('SecondsToTimeStringPipe', () => {
  it('create an instance', () => {
    const pipe = new SecondsToTimeStringPipe();
    expect(pipe).toBeTruthy();
  });
});
