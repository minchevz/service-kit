import { Context, Middleware, Next } from 'koa';

import { ILogger } from '@service-kit/common';
import { OpenApiError } from '../utils/openApiError';
import isOpenApiError from '../utils/isOpenApiError';

export function errorHandler(logger: ILogger): Middleware {
  return async function (ctx: Context, next: Next): Promise<void> {
    try {
      const start: number = new Date().getTime();

      await next();

      const responseTime: number = new Date().getTime() - start;
      const msg = `[Request-Success]: ${ ctx.method }, ${ ctx.URL }, ${ ctx.status } [Res Time]: ${ responseTime }ms`;

      logger.info(msg);
    } catch (error) {
      if (error.isAxiosError) {
        logger.error('[ServiceKitHttpError]: ', error);
        ctx.status = error.status;
        ctx.body = {
          message: error.message,
          ...error.details && { details: error.details }
        };
      } else if (isOpenApiError(error.message)) {
        const openApiError = new OpenApiError(error.message, error);

        logger.error('[OpenApiError]: ', openApiError);
        ctx.status = openApiError.status;
        ctx.body = {
          message: openApiError.message
        };
      } else {
        logger.error('[ServiceKitApplicationError]: ', error);
        ctx.status = error.status || 500;
        ctx.body = {
          message: error.message
        };
      }
    }
  };
}
