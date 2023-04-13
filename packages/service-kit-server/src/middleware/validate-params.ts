import { Next } from 'koa';
import { Context, IAjvSchema, ISchemaProperties } from '../../types';
import {
  extractParams,
  validateBody,
  validateParams,
  createValidationError
} from '../utils/validation';
import { ILogger } from '@service-kit/common';

export const validateRoute =
  (path: string, schema: IAjvSchema, logger: ILogger) =>
    async (ctx: Context, next: Next): Promise<void> => {
      const { method, ...params } = extractParams(ctx);

      try {
        const schemaEndpoint: ISchemaProperties = schema[path][method];

        if (schemaEndpoint.body) {
          validateBody(params, schemaEndpoint, logger);
        }
        validateParams(params, schemaEndpoint, logger);
      } catch (error) {
        createValidationError(ctx, error as Error);
      }

      await next();
    };
