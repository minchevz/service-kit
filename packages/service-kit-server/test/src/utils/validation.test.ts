import { RouterContext } from '@koa/router';
import { createMockContext } from '@shopify/jest-koa-mocks';
import { ILogger } from '@service-kit/common';

import {
  createSchema,
  extractParams,
  validateBody,
  validateParams
} from '../../../src/utils/validation';
import mockOpenApiContract from '../../mocks/mockContract.json';
import ajvSchemaMock from '../../mocks/ajvSchemaMock';
import { ISchemaProperties } from '../../../types';

const ctx = {
  ...createMockContext(),
  method: 'GET'
} as RouterContext;

const logger: ILogger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};

describe('Given the createSchema method', () => {
  it('when called with a valid openApi contract it should return an AJV validation schema', () => {
    const schema = createSchema(mockOpenApiContract);

    expect(JSON.stringify(schema)).toBe(JSON.stringify(ajvSchemaMock));
  });

  it('should throw when not called with a valid openApi contract', () => {
    const unexpectedError = 'It should have thrown!';

    try {
      createSchema({
        servers: [],
        paths: {
          '/post': {
            post: {
              'x-controller': 'anything',
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/example_post'
                    }
                  }
                },
                required: true
              }
            }
          }
        },
        components: {
          schemas: {}
        }
      });
      throw new Error(unexpectedError);
    } catch (error) {
      expect((error as { message: string }).message).not.toEqual(unexpectedError);
    }
  });
});

describe('Given the extractParams method', () => {
  describe('the method property', () => {
    it('should be the lowercased value of the context method', () => {
      const mockContext = {
        ...ctx,
        method: 'GET'
      };

      expect(extractParams(mockContext as RouterContext)).toHaveProperty('method', 'get');
    });
  });

  describe('the headers property', () => {
    it('should be headers of the request property on the context', () => {
      expect(extractParams(ctx as RouterContext)).toHaveProperty(
        'headers',
        ctx.request.req.headers
      );
    });
  });

  describe('the params property', () => {
    it('should be params property on the context', () => {
      expect(extractParams(ctx as RouterContext)).toHaveProperty('params', ctx.params);
    });
  });

  describe('the query property', () => {
    it('should be query property on the context', () => {
      expect(extractParams(ctx as RouterContext)).toHaveProperty('query', ctx.query);
    });
  });

  describe('the body property', () => {
    it('should be body of the request property on the context', () => {
      expect(extractParams(ctx as RouterContext)).toHaveProperty('body', ctx.request.body);
    });
  });
});

describe('Given the validateBody method', () => {
  it('should throw when there is no body property on the endpoint', () => {
    try {
      validateBody({}, {} as ISchemaProperties, logger);
      throw new Error('It should have thrown!');
    } catch (error) {
      expect((error as { message: string }).message).toEqual('body_validation_error');
    }
  });
});

describe('Given the validateParams method', () => {
  it('should throw when there is no parameters property on the endpoint', () => {
    try {
      validateParams({}, {} as ISchemaProperties, logger);
      throw new Error('It should have thrown!');
    } catch (error) {
      expect((error as { message: string }).message).toEqual('parameter_validation_error');
    }
  });

  it('should remove any numerically indexed params from path validation', () => {
    const mockRequest = {
      params: { id: 'test', '0': 'mock-match', '1': 'another' },
      query: { ...ctx.query },
      headers: { ...ctx.headers }
    };
    const mockSchema = {
      parameters: {
        validate: jest.fn().mockReturnValue(true)
      }
    };

    validateParams(mockRequest, mockSchema, logger);
    const validationArg = mockSchema.parameters.validate.mock.calls[0][0];

    expect(validationArg.path).toEqual({ id: 'test' });
  });
});
