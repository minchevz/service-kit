import { contentfulBodyParser } from '../../../src/middleware/contentful-body-parser';
import { Context } from '../../../types';

const logger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};

describe('Given the contentfulBodyParser middleware', () => {
  const ctx = {
    request: {},
    req: {
      on: jest.fn(),
    },
    is: jest.fn(),
  } as unknown as Context;

  const nextPromise: Promise<boolean | Error> = new Promise((resolve) => {
    resolve(true);
  });
  const next = (): Promise<boolean | Error> => nextPromise;

  const mockData = '{"key":"value"}';
  beforeAll(() => {
    ctx.is = jest.fn().mockReturnValue(true);
    ctx.req.on = jest.fn((event, callback) => {
      if (event === 'data') {
        callback(Buffer.from(mockData));
      } else if (event === 'end') {
        callback();
      }
      return ctx.req;
    });
  });

  beforeEach(async () => await contentfulBodyParser(logger)(ctx, next));

  it('should parse body if content type is application/vnd.contentful.management.v1+json', async () => {
    expect(ctx.request.body).toEqual(JSON.parse(mockData));
    await expect(nextPromise).resolves.toBe(true);
  });

  it('should log an error if JSON is invalid', async () => {
    ctx.is = jest.fn().mockReturnValue(true);
    const invalidData = '{"key":}'; // Invalid JSON
    ctx.req.on = jest.fn((event, callback) => {
      if (event === 'data') {
        callback(Buffer.from(invalidData));
      } else if (event === 'end') {
        callback();
      }
      return ctx.req; // Ensure it returns the req object for chaining
    });

    const middleware = contentfulBodyParser(logger);
    await middleware(ctx, next);

    expect(logger.error).toHaveBeenCalledWith('[ServiceKitApplicationError]: ', 'Invalid JSON');
    await expect(nextPromise).resolves.toBe(true);
  });
});
