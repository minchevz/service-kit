import { INTERNAL_SERVER_ERROR, OK } from '../../../src/constants/statusCodes';
import { loadController, executeFunctions } from '../../../src/utils/controllers';

import { Context } from '../../../types';

describe('The Controller utils module', () => {
  describe('loadController', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const dummyControllerFunction = async (): Promise<void> => {};

    const mockPaths = [ './src/controllers/', './src/another/' ];
    const mockControllers = {
      'src/controllers/defaultExport': { default: dummyControllerFunction },
      'src/controllers/expected': dummyControllerFunction,
      'src/controllers/sub/module': dummyControllerFunction,
      'src/another/expected': dummyControllerFunction
    };

    Object.entries(mockControllers).forEach(([ path, value ]) => {
      jest.mock(path, () => value, { virtual: true });
    });

    describe('when given a file that does not exist', () => {
      it('should return undefined', () => {
        expect(loadController(mockPaths, 'thisWillNeverExist')).toEqual(undefined);
      });
    });

    describe('when given a file that exports the controller as a named default export', () => {
      it('should return the controller function', () => {
        expect(loadController(mockPaths, 'defaultExport')).toBeInstanceOf(Function);
      });
    });

    describe('when given a file that exports the controller as the default', () => {
      it('should return the controller function', () => {
        expect(loadController(mockPaths, 'expected')).toBeInstanceOf(Function);
      });
    });

    describe('when given a file that includes a folder', () => {
      it('should return the controller function', () => {
        expect(loadController(mockPaths, 'sub/module')).toBeInstanceOf(Function);
      });
    });
  });

  describe('executeFunctions', () => {
    const healthChecksResolved = [
      () => Promise.resolve('value one'),
      () => Promise.resolve('value two')
    ];

    const healthChecksRejected = [
      () => Promise.resolve('value one'),
      () => Promise.reject(new Error('error'))
    ];

    const healthChecksException = [
      () => {
        throw new Error('error');
      }
    ];

    const ctx = {} as Context;

    it('should handle functions which run successfully', async () => {
      await executeFunctions(healthChecksResolved, ctx);
      expect(ctx.status).toBe(OK);
    });

    it('should handle functions with errors', async () => {
      await executeFunctions(healthChecksRejected, ctx);
      expect(ctx.status).toBe(INTERNAL_SERVER_ERROR);
    });

    it('should handle functions which throw exceptions', async () => {
      await executeFunctions(healthChecksException, ctx);
      expect(ctx.status).toBe(INTERNAL_SERVER_ERROR);
    });
  });
});
