import axios, { AxiosStatic } from 'axios';
import xml2js from 'xml2js';
import { IConfig, ILogger } from '@service-kit/common';
import * as ChimeraAuthService from '../../../src/services/ChimeraAuthService';

jest.mock('xml2js');
jest.mock('axios', () => {
  const mockAxios: AxiosStatic = jest.genMockFromModule('axios');

  mockAxios.create = jest.fn(() => mockAxios);

  return mockAxios;
});

describe('Given the Chimera Auth Service', () => {
  const mockConfigMap: { [index: string]: unknown } = {
    AUTH_DOMAIN: 'mock-auth-domain',
    AUTH_TIMEOUT: 3000,
    PROXY_CONFIG: { host: 'test.com', port: 1234, protocol: 'http' }
  };
  const mockConfig: IConfig = {
    get: jest.fn().mockImplementation((key: string): unknown => mockConfigMap[key]),
    has: jest.fn(),
    set: jest.fn(),
    getProperties: jest.fn()
  };
  const mockLogger: ILogger = {
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  };
  const createStub = jest.spyOn(axios, 'create');
  const getStub = jest.spyOn(axios, 'get');
  const xmlStub = jest.spyOn(xml2js, 'parseStringPromise');

  beforeEach(() => {
    getStub.mockResolvedValue({ status: 200 });
    xmlStub.mockResolvedValue({ token: 'mock-auth-token' });
    ChimeraAuthService.buildChimeraClient(mockConfig, mockLogger);
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

  describe('when Chimera Auth is called', () => {
    describe('when credentials are specified', () => {
      beforeAll(
        async () =>
          await ChimeraAuthService.authenticate(mockConfig.get('AUTH_DOMAIN'), {
            memberId: 123,
            authToken: 'mock-auth-token'
          })
      );

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call call Chimera', () => {
        expect(axios.get).toHaveBeenCalledWith(
          'mock-auth-domain/rest/chimera/123/token/mock-auth-token',
          undefined
        );
      });
    });

    describe('when chimera times out', () => {
      let errorThrown: Error;

      beforeAll(async () => {
        getStub.mockRejectedValue({ code: 'ECONNABORTED', message: 'timeout_error' });

        try {
          await ChimeraAuthService.authenticate(mockConfig.get('AUTH_DOMAIN'), {
            memberId: 123,
            authToken: 'mock-auth-token'
          });
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

    describe('when chimera returns error', () => {
      let errorThrown: Error;

      beforeAll(async () => {
        getStub.mockRejectedValue({
          response: { status: 401 },
          message: 'not authorized'
        });

        try {
          await ChimeraAuthService.authenticate(mockConfig.get('AUTH_DOMAIN'), {
            memberId: 123,
            authToken: 'mock-auth-token'
          });
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

    describe('when baseUrl are not specified', () => {
      beforeAll(
        async () =>
          await ChimeraAuthService.authenticate('', { memberId: 123, authToken: 'mock-auth-token' })
      );

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call call Chimera', () => {
        expect(mockLogger.warn).toHaveBeenCalledWith('Chimera Host config is not defined!');
      });
    });
  });

  describe('when buildChimeraClient is called', () => {
    beforeEach(async () => ChimeraAuthService.buildChimeraClient(mockConfig, mockLogger));

    describe('when proxy config false', () => {
      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call axios clientn with correct values', () => {
        expect(createStub).toHaveBeenCalledWith(
          expect.not.objectContaining({
            proxy: 'mock-auth-domain'
          })
        );
      });
    });

    describe('when proxy config true', () => {
      beforeAll(async () => (mockConfigMap['PP_PROXY_ENABLED'] = true));

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call axios clientn with correct values', () => {
        expect(createStub).toHaveBeenCalledWith(
          expect.objectContaining({
            proxy: { host: 'test.com', port: 1234, protocol: 'http' }
          })
        );
      });
    });
  });
});
