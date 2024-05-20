import { IncomingMessage } from 'http';
import { getRawBody } from '../../../src/utils/getRawBody';

describe('getRawBody', () => {
  it('should resolve with the data when data is received', async () => {
    const mockData = '{"key":"value"}';
    const req = {
      on: jest.fn()
    } as unknown as IncomingMessage;

    req.on = jest.fn((event, callback) => {
      if (event === 'data') {
        callback(Buffer.from(mockData));
      } else if (event === 'end') {
        callback();
      }
      return req;
    });

    await expect(getRawBody(req)).resolves.toEqual(mockData);
  });

  it('should reject the promise when there is an error event', async () => {
    const mockError = new Error('Test error');
    const req = {
      on: jest.fn()
    } as unknown as IncomingMessage;

    req.on = jest.fn((event, callback) => {
      if (event === 'error') {
        callback(mockError);
      }
      return req;
    });

    await expect(getRawBody(req)).rejects.toThrow(mockError);
  });
});
