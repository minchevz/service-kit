import axios, { AxiosStatic } from 'axios';
import xml2js from 'xml2js';
import { IConfig, ServiceKitApplicationError, ServiceKitHttpError } from '@service-kit/common';
import authentication, { AXIOS_TIMEOUT_CODE, client } from '../../../src/middleware/authentication';
import { IRoute } from '../../../src/interfaces/contract-interfaces';
import { Context } from '../../../types';

jest.mock('xml2js');
jest.mock('axios', () => {
  const mockAxios: AxiosStatic = jest.genMockFromModule('axios');

  mockAxios.create = jest.fn(() => mockAxios);

  return mockAxios;
});

describe('Given the authentication middleware', () => {
  const mockSpec: IRoute = {
    method: 'get',
    path: '/test',
    controller: 'controllers/test',
    details: {
      'x-controller': 'test'
    }
  } as IRoute;
  const mockAuthRequiredSpec: IRoute = {
    ...mockSpec,
    authEnabled: true,
    authRequired: true
  };
  const mockOptionalAuthSpec: IRoute = {
    ...mockSpec,
    authEnabled: true,
    authRequired: false
  };
  const baseContext = {
    headers: {
      'client-memberid': 'mock-member-id',
      'client-authtoken': 'mock-auth-token'
    }
  } as Partial<Context>;

  const mockConfigMap: { [index: string]: unknown } = {
    AUTH_DOMAIN: 'mock-auth-domain',
    AUTH_TIMEOUT: 3000,
    PP_PROXY_ENABLED: false,
    PROXY_CONFIG: { host: 'test.com', port: 1234, protocol: 'http' }
  };
  const mockConfig: IConfig = {
    get: jest.fn().mockImplementation((key: string): unknown => mockConfigMap[key]),
    has: jest.fn(),
    set: jest.fn(),
    getProperties: jest.fn()
  };
  const mockNext = jest.fn();
  const createStub = jest.spyOn(axios, 'create');
  const getStub = jest.spyOn(axios, 'get');
  const xmlStub = jest.spyOn(xml2js, 'parseStringPromise');

  beforeEach(() => {
    getStub.mockResolvedValue({ status: 200 });
    xmlStub.mockResolvedValue({ token: 'mock-auth-token' });
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

  describe('when authentication is not enabled', () => {
    const mockContext: Context = {
      ...baseContext,
      contract: mockSpec
    } as Context;

    beforeAll(async () => {
      await authentication(mockConfig)(mockContext, mockNext);
    });

    it('should not call Chimera', () => {
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should not set memberAuthSuccess', () => {
      expect(mockContext).not.toHaveProperty('memberAuthSuccess');
    });

    it('should call next', () => {
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('when auth is enabled but not required', () => {
    describe('when credentials are specified', () => {
      const mockContext: Context = {
        ...baseContext,
        contract: mockOptionalAuthSpec
      } as Context;

      beforeAll(async () => {
        await authentication(mockConfig)(mockContext, mockNext);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call call Chimera', () => {
        expect(axios.get).toHaveBeenCalledWith(
          '/rest/chimera/mock-member-id/token/mock-auth-token',
          { proxy: undefined }
        );
      });

      it('should set memberAuthSuccess to true', () => {
        expect(mockContext).toHaveProperty('memberAuthSuccess', true);
      });

      it('should call next', () => {
        expect(mockNext).toHaveBeenCalled();
      });
    });

    describe('when chimera returns a non 200', () => {
      const mockContext: Context = {
        ...baseContext,
        contract: mockOptionalAuthSpec
      } as Context;

      beforeAll(async () => {
        getStub.mockRejectedValue({
          response: { status: 401 },
          config: { url: mockConfigMap.AUTH_DOMAIN }
        });
        await authentication(mockConfig)(mockContext, mockNext);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should set context.memberAuthSuccess to false', () => {
        expect(mockContext).toHaveProperty('memberAuthSuccess', false);
      });

      it('should call next', () => {
        expect(mockNext).toHaveBeenCalled();
      });
    });

    describe('when chimera times out', () => {
      const mockContext: Context = {
        ...baseContext,
        contract: mockOptionalAuthSpec
      } as Context;

      beforeAll(async () => {
        getStub.mockRejectedValue({
          code: AXIOS_TIMEOUT_CODE,
          config: { url: mockConfigMap.AUTH_DOMAIN }
        });
        await authentication(mockConfig)(mockContext, mockNext);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should set context.memberAuthSuccess to false', () => {
        expect(mockContext).toHaveProperty('memberAuthSuccess', false);
      });

      it('should call next', () => {
        expect(mockNext).toHaveBeenCalled();
      });
    });
  });

  describe('when auth is enabled and required', () => {
    describe('when credentials are specified', () => {
      const mockContext: Context = {
        ...baseContext,
        contract: mockAuthRequiredSpec
      } as Context;

      beforeAll(async () => {
        await authentication(mockConfig)(mockContext, mockNext);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call call Chimera', () => {
        expect(axios.get).toHaveBeenCalledWith(
          '/rest/chimera/mock-member-id/token/mock-auth-token',
          { proxy: undefined }
        );
      });

      it('should set memberAuthSuccess to true', () => {
        expect(mockContext).toHaveProperty('memberAuthSuccess', true);
      });

      it('should call next', () => {
        expect(mockNext).toHaveBeenCalled();
      });
    });

    describe('when chimera returns a non 200', () => {
      const mockContext: Context = {
        ...baseContext,
        contract: mockAuthRequiredSpec
      } as Context;
      let errorThrown: Error;

      beforeAll(async () => {
        try {
          getStub.mockRejectedValue({
            response: { status: 401 },
            message: 'authentication_failed',
            config: { url: mockConfigMap.AUTH_DOMAIN }
          });
          await authentication(mockConfig)(mockContext, mockNext);
        } catch (error) {
          errorThrown = error as Error;
        }
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should not call next', () => {
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should throw a ServiceKitApplicationError', () => {
        expect(errorThrown).toBeInstanceOf(ServiceKitHttpError);
        expect(errorThrown).toHaveProperty('message', 'authentication_failed');
        expect(errorThrown).toHaveProperty('status', 401);
      });
    });

    describe('when chimera times out', () => {
      const mockContext: Context = {
        ...baseContext,
        contract: mockAuthRequiredSpec
      } as Context;
      let errorThrown: Error;

      beforeAll(async () => {
        try {
          getStub.mockRejectedValue({
            code: AXIOS_TIMEOUT_CODE,
            message: 'authentication_timeout',
            config: { url: mockConfigMap.AUTH_DOMAIN }
          });
          await authentication(mockConfig)(mockContext, mockNext);
        } catch (error) {
          errorThrown = error as Error;
        }
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should not call next', () => {
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should throw a ServiceKitApplicationError', () => {
        expect(errorThrown).toBeInstanceOf(ServiceKitHttpError);
        expect(errorThrown).toHaveProperty('message', 'authentication_timeout');
        expect(errorThrown).toHaveProperty('status', 500);
      });
    });
  });

  describe('when a non-auth related error is caught', () => {
    const mockContext: Context = {
      ...baseContext,
      contract: mockAuthRequiredSpec
    } as Context;
    let errorThrown: Error;

    beforeAll(async () => {
      try {
        getStub.mockRejectedValue(new Error('some other error'));
        await authentication(mockConfig)(mockContext, mockNext);
      } catch (error) {
        errorThrown = error as Error;
      }
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('it should throw the original error', () => {
      expect(errorThrown).not.toBeInstanceOf(ServiceKitApplicationError);
      expect(errorThrown.message).not.toContain('authentication');
    });
  });

  describe('when a non-auth related error is caught', () => {
    const mockContext: Context = {
      ...baseContext,
      contract: mockAuthRequiredSpec
    } as Context;

    beforeAll(async () => {
      client.defaults.baseURL = undefined;
      mockConfigMap.PP_PROXY_ENABLED = true;
      getStub.mockResolvedValue({ status: 200 });
      xmlStub.mockResolvedValue({ token: 'mock-auth-token' });
      await authentication(mockConfig)(mockContext, mockNext);
    });

    it('should call call Chimera', () => {
      expect(axios.get).toHaveBeenCalledWith('/rest/chimera/mock-member-id/token/mock-auth-token', {
        proxy: { host: 'test.com', port: 1234, protocol: 'http' }
      });
    });
  });
});
