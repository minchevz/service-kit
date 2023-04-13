import timestampFirst from '../../../src/formatters/timestampFirst';

describe('timestampFirst Formatter', () => {
  it('should export an object with a transform function', () => {
    expect(timestampFirst).toBeInstanceOf(Object);
    expect(timestampFirst.transform).toBeInstanceOf(Function);
  });

  it('transform should add an _timestamp field to the object that matches the timestmap field', () => {
    const info = timestampFirst.transform({
      anything: 'anything',
      two: 'two',
      timestamp: 'timestamp'
    });

    expect(info._timestamp).toBe('timestamp');
  });
});
