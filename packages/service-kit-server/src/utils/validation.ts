import { Context } from 'koa';
import apiSchemaBuilder from 'api-schema-builder';
import { ILogger } from '@service-kit/common';
import {
  IAjvSchema,
  ICtxRequestParams,
  IRequestParams,
  IRequestObject,
  IValidationError,
  ISchemaProperties,
  Method
} from '../../types';
import { ISwaggerSpec } from '../interfaces/contract-interfaces';

export const createSchema = (contract: ISwaggerSpec): IAjvSchema => {
  try {
    return apiSchemaBuilder.buildSchemaSync(contract, {
      ajvConfigParams: {
        removeAdditional: true
      }
    });
  } catch (error) {
    throw error;
  }
};

export const extractParams = (ctx: Context): ICtxRequestParams => ({
  method: ctx.method.toLowerCase() as Method,
  headers: ctx.request.req.headers,
  params: ctx.params,
  query: ctx.query,
  body: ctx.request.body
});

export const validateBody = (
  requestOptions: IRequestParams,
  schemaEndpoint: ISchemaProperties,
  logger: ILogger
): void => {
  const isBodyMatch = schemaEndpoint.body?.validate?.(requestOptions.body);

  if (!isBodyMatch) {
    logger.warn('Body invalid', schemaEndpoint.parameters?.errors);
    throw new Error('body_validation_error');
  }
};

export const validateParams = (
  requestOptions: IRequestParams,
  schemaEndpoint: ISchemaProperties,
  logger: ILogger
): void => {
  /*
    If using plain regex pathing, Koa maps any captures to numerical parameters.
    These cannot be specified in the OpenAPI contract, leading to parameter errors.
    Therefore, strip out numerically indexed params/
  */
  const paramsToValidate = Object.entries(requestOptions.params || {}).reduce(
    (acc: IRequestObject, [ key, value ]) => {
      if (!Number.isInteger(parseInt(key, 10))) {
        acc[key] = value;
      }

      return acc;
    },
    {}
  ) as IRequestObject;

  const isParametersMatch = schemaEndpoint.parameters?.validate?.({
    query: requestOptions.query,
    headers: requestOptions.headers,
    path: paramsToValidate
  });

  if (!isParametersMatch) {
    logger.warn('Parameters invalid', schemaEndpoint.parameters?.errors);
    throw new Error('parameter_validation_error');
  }
};

export const createValidationError = (ctx: Context, error: Error): IValidationError =>
  ctx.throw(404, error.message, {
    type: 'Validation Error',
    instance: ctx.url
  });
