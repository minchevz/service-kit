import axios, { AxiosStatic } from 'axios';
import { IConfig, ILogger, ServiceKitHttpError } from '@service-kit/common';
import * as SessionService from '../../../src/services/SessionService';

jest.mock('axios', () => {
  const mockAxios: AxiosStatic = jest.genMockFromModule('axios');

  mockAxios.create = jest.fn(() => mockAxios);

  return mockAxios;
});

describe('Given the Session Service', () => {
  const mockConfigMap: { [index: string]: unknown } = {
    AUTH_DOMAIN: 'mock-auth-domain',
    AUTH_TIMEOUT: 3000,
    PROXY_CONFIG: { host: 'test.com', port: 1234, protocol: 'http' },
  };
  const mockConfig: IConfig = {
    get: jest.fn().mockImplementation((key: string): unknown => mockConfigMap[key]),
    has: jest.fn(),
    set: jest.fn(),
    getProperties: jest.fn(),
  };
  const mockLogger: ILogger = {
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  };
  const createStub = jest.spyOn(axios, 'create');
  const getStub = jest.spyOn(axios, 'get');
  const sessionID = '123';

  beforeEach(() => {
    getStub.mockResolvedValue({ status: 200 });
    SessionService.buildSessionClient(mockConfig, mockLogger);
  });

  describe('When app starts', () => {
    it('should setup the base axios client', () => {
      if (createStub.mock.calls[0][0]) {
        const { validateStatus, httpAgent } = createStub.mock.calls[0][0];

        expect(httpAgent.keepAlive).toEqual(true);
        expect(validateStatus?.(200)).toEqual(true);
        expect(validateStatus?.(300)).toEqual(false);
        expect(validateStatus?.(400)).toEqual(false);
        expect(validateStatus?.(500)).toEqual(false);
      }
    });
  });

  describe('when Session Auth is called', () => {
    describe('when session id is given', () => {
      beforeAll(
        async () => {
          SessionService.buildSessionClient(mockConfig, mockLogger);
          getStub.mockResolvedValue({ status: 200, headers: { 'member-jwt': '123'} });
          await SessionService.authenticate(mockConfig.get('AUTH_DOMAIN'), sessionID, {})
        }
      );

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call Session', () => {
        expect(axios.get).toHaveBeenCalledWith(
          'mock-auth-domain/session/validate',
          {"headers": {"session-id": "123"}}
        );
      });
    });

    describe('when Session times out', () => {
      let errorThrown: Error;

      beforeAll(async () => {
        getStub.mockRejectedValue({ code: 'ECONNABORTED', message: 'timeout_error' });

        try {
          await SessionService.authenticate(mockConfig.get('AUTH_DOMAIN'), sessionID);
        } catch (err) {
          errorThrown = err;
        }
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call next', () => {
        expect(errorThrown.message).toContain('timeout_error');
      });
    });

    describe('when Session returns error', () => {
      let errorThrown: Error;

      beforeAll(async () => {
        getStub.mockRejectedValue({
          response: { status: 401 },
          message: 'not authorized',
        });

        try {
          await SessionService.authenticate(mockConfig.get('AUTH_DOMAIN'), sessionID);
        } catch (err) {
          errorThrown = err;
        }
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call next', () => {
        expect(errorThrown.message).toContain('not authorized');
      });
    });

    describe('when baseUrl is not specified', () => {
      let errorThrown: Error;

      beforeAll(async () => {
        try {
          await SessionService.authenticate('', sessionID, {})
        } catch (err) {
          errorThrown = err as Error;
        }
      })

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should give the correct error payload', () => {
        expect(mockLogger.warn).toHaveBeenCalledWith('Session Host config is not defined!');
        expect(errorThrown).toBeInstanceOf(ServiceKitHttpError);
      });
    });
  });

  describe('when buildSessionClient is called', () => {
    beforeEach(async () => SessionService.buildSessionClient(mockConfig, mockLogger));

    describe('when proxy config false', () => {
      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call axios client with correct values', () => {
        expect(createStub).toHaveBeenCalledWith(
          expect.not.objectContaining({
            proxy: 'mock-auth-domain',
          })
        );
      });
    });

    describe('when proxy config true', () => {
      beforeAll(async () => (mockConfigMap['PP_PROXY_ENABLED'] = true));

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call axios client with correct values', () => {
        expect(createStub).toHaveBeenCalledWith(
          expect.objectContaining({
            proxy: { host: 'test.com', port: 1234, protocol: 'http' },
          })
        );
      });
    });
  });
});
