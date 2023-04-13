import Koa from 'koa';
import * as urlChecker from '../../../src/utils/redirectUrlValidator';
import { safeRedirect, PATCH_MESSAGE } from '../../../src/utils/safeRedirect';
import { ILogger } from '@service-kit/common';

jest.mock('koa', () => jest.fn(() => koaMock));

const internalKoaRedirectMock = jest.fn();
const koaMock = {
  context: { redirect: internalKoaRedirectMock }
};
const logger: ILogger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};

describe('Given the safeRedirect method', () => {
  const koaApp: Koa<Koa.DefaultState, Koa.DefaultContext> = new Koa();

  describe('wrapping the internal koa redirect method', () => {
    beforeAll(() => {
      jest.spyOn(urlChecker, 'checkUri');
      jest.spyOn(Object, 'defineProperty');

      return safeRedirect(koaApp, logger);
    });

    afterEach(() => jest.clearAllMocks());

    it('should attach the wrapped version to the koa.context', () => {
      expect(logger.info).toBeCalledTimes(1);
      expect(logger.info).toBeCalledWith(PATCH_MESSAGE);
      expect(Object.defineProperty).toBeCalledTimes(1);
      expect(Object.defineProperty).toBeCalledWith(koaApp.context, 'redirect', expect.anything());
    });

    it('should encode a passed in url before passing it to the internal koa redirect', () => {
      const url = "/dummy?id=<script>alert('nope');</script>message=1";

      koaApp.context.redirect(url);
      expect(urlChecker.checkUri).toBeCalledTimes(1);
      expect(internalKoaRedirectMock).toBeCalledTimes(1);
    });

    it('should make sure any alt url is also encoded before passing it to the koa redirect method', () => {
      const altUrl = "/dummy?id=<script>alert('nope');</script>message=1";

      koaApp.context.redirect('back', altUrl);
      expect(urlChecker.checkUri).toBeCalledTimes(2);
    });
  });

  describe('when there is an unexpected error during initialization', () => {
    const newKoaApp: Koa<Koa.DefaultState, Koa.DefaultContext> = new Koa();
    const ERR_MESSAGE = "Well that's not good";

    beforeEach(() => {
      jest.spyOn(urlChecker, 'checkUri').mockImplementation(() => {
        throw new Error(ERR_MESSAGE);
      });
    });

    afterEach(() => jest.clearAllMocks());

    it('should catch and propagate the error', () => {
      try {
        safeRedirect(newKoaApp, logger);
      } catch (error) {
        expect(logger.info).toBeCalledTimes(1);
        expect(logger.error).toBeCalledWith(error);
        expect((error as { message: string }).message).toEqual(ERR_MESSAGE);
      }
    });

    it('should attach the wrapped version to the koa.context', () => {
      const url = '/breaking?oh noz >.<';

      koaApp.context.redirect(url);
      expect(urlChecker.checkUri).toBeCalledTimes(2);
    });
  });
});
