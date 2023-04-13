import { Context } from '../../../types';
import liveCheckController from '../../../src/controllers/live-check';

import { OK, INTERNAL_SERVER_ERROR } from '../../../src/constants/statusCodes';

const EXPECTED_PROMISE_ONE_RESPONSE = 'value one';
const EXPECTED_PROMISE_TWO_RESPONSE = 'value two';
const EXPECTED_PROMISE_TWO_ERROR_RESPONSE = new Error('woopsi');
const EXPECTED_INTERNAL_ERROR_RESPONSE = 'func is not a function';

const healthChecksResolved = [
  () => Promise.resolve('value one'),
  () => Promise.resolve('value two')
];

const healthChecksRejected = [
  () => Promise.resolve('value one'),
  () => Promise.reject(new Error('woopsi'))
];

const healthChecksException = [ new Error() ];

describe('Given the live-check Controller', () => {
  const ctx: Context = {} as Context;

  describe('when all service checks have returned successfully', () => {
    beforeAll(() => {
      liveCheckController(healthChecksResolved)(ctx);
    });

    it('should respond with a 200', () => {
      expect(ctx.status).toEqual(OK);
    });

    it('should respond with the correct format', () => {
      expect(ctx.body).toEqual({
        healthy: true,
        responses: [ EXPECTED_PROMISE_ONE_RESPONSE, EXPECTED_PROMISE_TWO_RESPONSE ]
      });
    });
  });

  describe('when one or more service checks has failed', () => {
    beforeAll(() => {
      liveCheckController(healthChecksRejected)(ctx);
    });

    it('should respond with a 500, INTERNAL_SERVER_ERROR', () => {
      expect(ctx.status).toEqual(INTERNAL_SERVER_ERROR);
    });

    it('should respond with the correct format', () => {
      expect(ctx.body).toEqual({
        healthy: false,
        responses: [ EXPECTED_PROMISE_ONE_RESPONSE, EXPECTED_PROMISE_TWO_ERROR_RESPONSE ]
      });
    });
  });

  describe('when the controllerOptions are empty', () => {
    beforeAll(() => {
      liveCheckController([])(ctx);
    });

    it('should respond with a 200, INTERNAL_SERVER_ERROR', () => {
      expect(ctx.status).toEqual(OK);
    });

    it('should have no responses to report', () => {
      expect((ctx.body as { responses: unknown[] }).responses.length).toBe(0);
    });
  });

  describe('when an exception has occurred', () => {
    beforeAll(() => {
      liveCheckController(healthChecksException as never)(ctx);
    });

    it('should respond with a 500, INTERNAL_SERVER_ERROR', () => {
      expect(ctx.status).toEqual(INTERNAL_SERVER_ERROR);
    });

    it('should always respond with the correct format', () => {
      expect(ctx.body).toEqual({
        healthy: false,
        message: EXPECTED_INTERNAL_ERROR_RESPONSE
      });
    });
  });
});
