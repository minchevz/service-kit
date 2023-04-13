/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMockContext } from '@shopify/jest-koa-mocks';
import { ILogger } from '@service-kit/common';

import mockOpenApiContract from '../../mocks/mockContract.json';
import * as requestValidation from '../../../src/middleware/validate-params';
import * as validationUtils from '../../../src/utils/validation';
import {
  mockContextReqParams,
  mockQueryParams,
  mockContextBodyParams,
  mockQueryParamsReqOptions,
  mockContextBodyReqOptions,
  mockContextReqParamsReqOptions
} from '../../mocks/mockRequests';

const logger: ILogger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};

const EXPECTED_ERROR_STATUS = 404;

describe('Given the validateRoute middleware', () => {
  const ctx = createMockContext();
  const nextPromise: Promise<any> = new Promise((resolve) => {
    resolve(true);
  });
  const next = (): Promise<any> => nextPromise;
  const schema = validationUtils.createSchema(mockOpenApiContract);

  beforeAll(() => {
    jest.spyOn(validationUtils, 'extractParams');
    jest.spyOn(validationUtils, 'validateParams');
    jest.spyOn(validationUtils, 'validateBody');
    jest.spyOn(validationUtils, 'createValidationError');
  });
  describe('when called on a route with request parameters', () => {
    const customContext: any = {
      ...ctx,
      ...mockContextReqParams
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return successfully and call next middleware if the request parameters match', async () => {
      const method = customContext.method.toLowerCase();
      const schemaRoute = schema[customContext.url][method];

      await requestValidation.validateRoute(customContext.url, schema, logger)(customContext, next);

      expect(validationUtils.extractParams).toBeCalledTimes(1);
      expect(validationUtils.validateParams).toBeCalledTimes(1);
      expect(validationUtils.validateParams).toBeCalledWith(
        mockContextReqParamsReqOptions,
        schemaRoute,
        logger
      );
      expect(validationUtils.validateBody).toBeCalledTimes(0);

      return expect(nextPromise).resolves.toBe(true);
    });

    it('should throw a parameter_validation_error error if the request parameters do not match', async () => {
      const amendedContext: any = {
        ...customContext,
        params: { banana: 'test' }
      };
      const errorType = {
        type: 'Validation Error',
        instance: amendedContext.url
      };

      await requestValidation.validateRoute(
        customContext.url,
        schema,
        logger
      )(amendedContext, next);

      expect(validationUtils.createValidationError).toHaveBeenCalledTimes(1);
      expect(validationUtils.createValidationError).toBeCalledWith(
        amendedContext,
        new Error('parameter_validation_error')
      );
      expect(amendedContext.throw).toBeCalledTimes(1);
      expect(amendedContext.throw).toBeCalledWith(
        EXPECTED_ERROR_STATUS,
        'parameter_validation_error',
        errorType
      );
    });
  });

  describe('when called on a route with body params', () => {
    const customContext: any = {
      ...ctx,
      ...mockContextBodyParams
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return successfully and call next middleware if the request body matches', async () => {
      const method = customContext.method.toLowerCase();
      const schemaRoute = schema[customContext.url][method];

      await requestValidation.validateRoute(customContext.url, schema, logger)(customContext, next);

      expect(validationUtils.extractParams).toBeCalledTimes(1);
      expect(validationUtils.validateBody).toBeCalledTimes(1);
      expect(validationUtils.validateBody).toBeCalledWith(
        mockContextBodyReqOptions,
        schemaRoute,
        logger
      );

      expect(validationUtils.validateParams).toBeCalledTimes(1);

      return expect(nextPromise).resolves.toBe(true);
    });

    it('should throw a body_validation_error error the one of the required body params are missing', async () => {
      const amendedContext: any = {
        ...customContext
      };

      amendedContext.request.body = { value: 'this is a post' };

      const errorType = {
        type: 'Validation Error',
        instance: amendedContext.url
      };
      const schema = validationUtils.createSchema(mockOpenApiContract);

      await requestValidation.validateRoute(
        customContext.url,
        schema,
        logger
      )(amendedContext, next);

      expect(validationUtils.createValidationError).toHaveBeenCalledTimes(1);
      expect(validationUtils.createValidationError).toBeCalledWith(
        amendedContext,
        new Error('body_validation_error')
      );
      expect(amendedContext.throw).toBeCalledTimes(1);
      expect(amendedContext.throw).toBeCalledWith(
        EXPECTED_ERROR_STATUS,
        'body_validation_error',
        errorType
      );
    });
  });

  describe('when called on a route with headers and query params', () => {
    const customContext: any = {
      ...ctx,
      ...mockQueryParams
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return successfully and call next middleware if the request headers and query params match', async () => {
      const method = customContext.method.toLowerCase();
      const schemaRoute = schema[customContext.url][method];

      await requestValidation.validateRoute(customContext.url, schema, logger)(customContext, next);

      expect(validationUtils.extractParams).toBeCalledTimes(1);
      expect(validationUtils.validateParams).toBeCalledTimes(1);
      expect(validationUtils.validateParams).toBeCalledWith(
        mockQueryParamsReqOptions,
        schemaRoute,
        logger
      );
      expect(validationUtils.validateBody).toBeCalledTimes(0);

      return expect(nextPromise).resolves.toBe(true);
    });

    it('should return successfully and call next middleware if query params match and the required headers are present', async () => {
      const amendedContext: any = {
        ...customContext,
        request: { req: { headers: { logname: 'hello' } } }
      };

      await requestValidation.validateRoute(
        customContext.url,
        schema,
        logger
      )(amendedContext, next);

      expect(validationUtils.extractParams).toBeCalledTimes(1);
      expect(validationUtils.validateParams).toBeCalledTimes(1);
      expect(validationUtils.validateBody).toBeCalledTimes(0);

      return expect(nextPromise).resolves.toBe(true);
    });

    it('should throw a parameter_validation_error error if parameters match but the required headers are missing', async () => {
      const amendedContext: any = {
        ...customContext,
        request: { req: { headers: { logtype: [ 'what am I', 'banana' ] } } }
      };
      const errorType = {
        type: 'Validation Error',
        instance: amendedContext.url
      };

      await requestValidation.validateRoute(
        customContext.url,
        schema,
        logger
      )(amendedContext, next);

      expect(validationUtils.createValidationError).toHaveBeenCalledTimes(1);
      expect(validationUtils.createValidationError).toBeCalledWith(
        amendedContext,
        new Error('parameter_validation_error')
      );
      expect(amendedContext.throw).toBeCalledTimes(1);
      expect(amendedContext.throw).toBeCalledWith(
        EXPECTED_ERROR_STATUS,
        'parameter_validation_error',
        errorType
      );
    });

    it('should throw a parameter_validation_error error if parameters do not match', async () => {
      const amendedContext: any = {
        ...customContext,
        query: { banana: 'test' }
      };
      const errorType = {
        type: 'Validation Error',
        instance: amendedContext.url
      };

      await requestValidation.validateRoute(
        customContext.url,
        schema,
        logger
      )(amendedContext, next);

      expect(validationUtils.createValidationError).toHaveBeenCalledTimes(1);
      expect(validationUtils.createValidationError).toBeCalledWith(
        amendedContext,
        new Error('parameter_validation_error')
      );
      expect(amendedContext.throw).toBeCalledTimes(1);
      expect(amendedContext.throw).toBeCalledWith(
        EXPECTED_ERROR_STATUS,
        'parameter_validation_error',
        errorType
      );
    });
  });

  describe('when called on invalid route', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should throw an error if the requested route is not matching the schema', async () => {
      const amendedContext: any = {
        ...ctx,
        ...mockContextReqParams,
        url: '/banana',
        _matchedRoute: '/banana'
      };

      await requestValidation.validateRoute(
        amendedContext.url,
        schema,
        logger
      )(amendedContext, next);

      expect(validationUtils.createValidationError).toHaveBeenCalledTimes(1);
      expect(amendedContext.throw).toBeCalledTimes(1);
    });
  });

  describe('when called with invalid method for a route', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should throw an error if the request method is not matching the schema', async () => {
      const amendedContext: any = {
        ...ctx,
        ...mockContextReqParams,
        method: 'PUT'
      };

      await requestValidation.validateRoute(
        amendedContext.url,
        schema,
        logger
      )(amendedContext, next);

      expect(validationUtils.createValidationError).toHaveBeenCalledTimes(1);
      expect(amendedContext.throw).toBeCalledTimes(1);
    });
  });

  describe('should throw validation error', () => {
    const amendedContext: any = {
      ...ctx,
      ...mockContextReqParams
    };
    const ERROR_MESSAGE = 'oh no >.<';
    const ERROR = new Error(ERROR_MESSAGE);

    beforeAll(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    it('when validateBody method throws unexpectedly', async () => {
      const errorType = {
        type: 'Validation Error',
        instance: amendedContext.url
      };

      jest.spyOn(validationUtils, 'validateParams').mockImplementation(() => {
        throw ERROR;
      });

      await requestValidation.validateRoute(
        amendedContext.url,
        schema,
        logger
      )(amendedContext, next);

      expect(validationUtils.createValidationError).toHaveBeenCalledTimes(1);
      expect(validationUtils.createValidationError).toBeCalledWith(
        amendedContext,
        new Error(ERROR_MESSAGE)
      );
      expect(amendedContext.throw).toBeCalledTimes(1);
      expect(amendedContext.throw).toBeCalledWith(EXPECTED_ERROR_STATUS, ERROR_MESSAGE, errorType);
    });

    it('when validateParams method throws unexpectedly', async () => {
      const errorType = {
        type: 'Validation Error',
        instance: amendedContext.url
      };

      jest.spyOn(validationUtils, 'validateBody').mockImplementation(() => {
        throw ERROR;
      });

      await requestValidation.validateRoute(
        amendedContext.url,
        schema,
        logger
      )(amendedContext, next);

      expect(validationUtils.createValidationError).toHaveBeenCalledTimes(1);
      expect(validationUtils.createValidationError).toBeCalledWith(
        amendedContext,
        new Error(ERROR_MESSAGE)
      );
      expect(amendedContext.throw).toBeCalledTimes(1);
      expect(amendedContext.throw).toBeCalledWith(EXPECTED_ERROR_STATUS, ERROR_MESSAGE, errorType);
    });
  });
});
