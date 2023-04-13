import { errorHandler } from '../../../src/middleware/error-handler';
import { Context, IError } from '../../../types';
import * as errorUtils from '../../../src/utils/errors';
import { ServiceKitHttpError } from '@service-kit/common';

const mockErrorDictionary: Record<string, IError> = {
  body_validation_error: {
    http_code: 400,
    message: 'Validation Error'
  },
  internal_error: {
    http_code: 500,
    message: 'example'
  }
};
const logger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};

describe('Given the errorHandler middleware', () => {
  const ctx: Context = {
    errors: {},
    headers: {}
  } as Context;
  let nextPromise: Promise<boolean | Error> = new Promise((resolve) => {
    resolve(true);
  });
  const next = (): Promise<boolean | Error> => nextPromise;

  beforeAll(() =>
    jest.spyOn(errorUtils, 'findDictionaryLocale').mockReturnValue(mockErrorDictionary)
  );

  beforeEach(async () => await errorHandler(logger)(ctx, next));

  it('runs the next middleware and resolves', async () => {
    expect(nextPromise).resolves.toBe(true);
  });

  describe('when error is Application Error,', () => {
    const mockError = new Error('test');

    mockError.stack = '';

    beforeAll(() => {
      nextPromise = new Promise((_, reject) => reject(mockError));
    });

    it('returns server error', async () => {
      await errorHandler(logger)(ctx, next);

      expect(ctx).toHaveProperty('status', 500);
      expect(ctx.body).toHaveProperty('message', mockError.message);
    });
  });

  describe('when error is Axios Error,', () => {
    const error = {
      name: 'test',
      isAxiosError: true,
      message: 'test-error',
      code: '',
      config: {
        headers: {},
        baseURL: 'test'
      },
      response: {
        data: null,
        status: 404,
        headers: {},
        config: {},
        statusText: 'NOT_FOUND'
      },
      toJSON: () => jest.fn()
    };
    const axiosError = new ServiceKitHttpError(error.message, error);

    beforeAll(() => {
      nextPromise = new Promise((_, reject) => reject(axiosError));
    });

    it('returns server error', async () => {
      await errorHandler(logger)(ctx, next);

      expect(ctx).toHaveProperty('status', axiosError.status);
      expect(ctx.body).toHaveProperty('message', axiosError.message);
    });

    describe('and there is details,', () => {
      beforeAll(() => {
        axiosError.details = { data: 'test' };
        nextPromise = new Promise((_, reject) => reject(axiosError));
      });

      it('returns server error', async () => {
        await errorHandler(logger)(ctx, next);

        expect(ctx).toHaveProperty('status', axiosError.status);
        expect(ctx.body).toHaveProperty('message', axiosError.message);
        expect(ctx.body).toHaveProperty('details', axiosError.details);
      });
    });
  });

  describe('when error is OpenApi Error,', () => {
    const openApiError = {
      message: 'RequestValidationError',
      expose: true,
      code: 400,
      location: { in: 'header' },
      suggestions: [ { path: '', start: '', error: 'reason' } ]
    };

    beforeAll(() => {
      nextPromise = new Promise((_, reject) => reject(openApiError));
    });

    it('returns server error', async () => {
      await errorHandler(logger)(ctx, next);

      expect(ctx).toHaveProperty('status', openApiError.code);
      expect(ctx.body).toHaveProperty('message', openApiError.message);
    });
  });
});
