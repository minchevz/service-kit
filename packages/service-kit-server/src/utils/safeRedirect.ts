import Koa from 'koa';
import { checkUri } from './redirectUrlValidator';
import { ILogger } from '@service-kit/common';

export const PATCH_MESSAGE =
  'Patching koa redirect security issue - https://github.com/koajs/koa/issues/1250';

export const safeRedirect = (
  app: Koa<Koa.DefaultState, Koa.DefaultContext>,
  logger: ILogger
): void => {
  const koaRedirect = app.context.redirect;

  logger.info(PATCH_MESSAGE);

  Object.defineProperty(app.context, 'redirect', {
    get() {
      return (url: string, alt?: string) => {
        let safeUri = '';
        let safeAlt;

        try {
          safeUri = checkUri(url);
          if (alt) {
            safeAlt = checkUri(alt);
          }
        } catch (error) {
          logger.error(error as string);
          throw error;
        } finally {
          return koaRedirect.bind(this, safeUri, safeAlt)();
        }
      };
    }
  });
};
