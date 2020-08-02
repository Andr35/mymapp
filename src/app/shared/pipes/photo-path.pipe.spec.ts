import {PhotoPathPipe} from './photo-path.pipe';

describe('PhotoPathPipe', () => {
  it('create an instance', () => {
    const pipe = new PhotoPathPipe(null as any, null as any);
    expect(pipe).toBeTruthy();
  });
});
