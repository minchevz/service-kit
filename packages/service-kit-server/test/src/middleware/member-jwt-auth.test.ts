import axios, { AxiosStatic } from 'axios';
import {
  IConfig,
  ServiceKitApplicationError,
  ServiceKitHttpError,
} from '@service-kit/common';
import authentication, { client } from '../../../src/middleware/member-jwt-auth';
import { IRoute } from '../../../src/interfaces/contract-interfaces';
import { Context } from '../../../types';

jest.mock('axios', () => {
  const mockAxios: AxiosStatic = jest.genMockFromModule('axios');

  mockAxios.create = jest.fn(() => mockAxios);

  return mockAxios;
});

jest.mock('jsonwebtoken', () => {
  const mockJwt = {
    decode: jest.fn(token => ({ memberId: '99999', token })),
  };
  return mockJwt;
});

describe('Given the member-jwt middleware', () => {
  const mockSpec: IRoute = {
    method: 'get',
    path: '/test',
    controller: 'controllers/test',
    details: {
      'x-controller': 'test',
    },
    authEnabled: false,
    authRequired: false,
  } as IRoute;
  const mockAuthRequiredSpec: IRoute = {
    ...mockSpec,
    memberJwtAuth: true,
    memberJwtAuthRequired: true,
  };
  const mockOptionalAuthSpec: IRoute = {
    ...mockSpec,
    memberJwtAuth: true,
    memberJwtAuthRequired: false,
  };
  const contextCookies = {
    cookies: {
      get: jest.fn().mockReturnValue('mocked-session-id'),
    },
  };
  const baseContext = {
    headers: {
      'client-memberid': '99999',
      'client-authtoken': 'mock-auth-token',
      'member-jwt': 'mock-jwt',
    },
  } as Partial<Context>;

  const mockConfigMap: { [index: string]: unknown } = {
    AUTH_DOMAIN: 'mock-auth-domain',
    AUTH_TIMEOUT: 3000,
    PP_PROXY_ENABLED: false,
    PROXY_CONFIG: { host: 'test.com', port: 1234, protocol: 'http' },
  };
  const mockConfig: IConfig = {
    get: jest.fn().mockImplementation((key: string): unknown => mockConfigMap[key]),
    has: jest.fn(),
    set: jest.fn(),
    getProperties: jest.fn(),
  };
  const mockNext = jest.fn();
  const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
                  eyJzdWIiOiIxMjM0NTY3ODkwIiwiaXNzIjoiSmVyci
                  IsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoiMTIzIiwi
                  bWVtYmVySWQiOiI5OTk5OSIsInZlbnR1cmVOYW1lIj
                  oiamFja3BvdGpveSIsImxvZ2luSWQiOiIwMDAifQ.4
                  X1CJt8yLvrwBKbayXPxzGjW4HAOd1bIEQYbku4itZA`;

  const createStub = jest.spyOn(axios, 'create');
  const getStub = jest.spyOn(axios, 'get');

  beforeEach(() => {
    getStub.mockResolvedValue({ status: 200 });
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
      contract: mockSpec,
    } as Context;

    beforeAll(async () => {
      await authentication(mockConfig)(mockContext, mockNext);
    });

    it('should not call Session-Service', () => {
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
    describe('when session-id is specified', () => {
      const mockContext: Context = {
        ...baseContext,
        ...contextCookies,
        contract: mockOptionalAuthSpec,
      } as unknown as Context;

      beforeAll(async () => {
        getStub.mockResolvedValue({
          code: 200,
          config: { url: mockConfigMap.AUTH_DOMAIN },
          headers: {
            'member-jwt': mockJwt,
          },
        });
        await authentication(mockConfig)(mockContext, mockNext);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call Session-Service', () => {
        expect(axios.get).toHaveBeenCalledWith('/session/validate', {
          proxy: undefined,
          headers: {
            'session-id': 'mocked-session-id',
          },
        });
      });

      it('should call next', () => {
        expect(mockNext).toHaveBeenCalled();
      });
    });

    describe('when session-id is not set', () => {
      const mockContext: Context = {
        ...baseContext,
        cookies: {
          get: jest.fn().mockReturnValue(undefined),
        },
        contract: mockOptionalAuthSpec,
      } as unknown as Context;

      beforeAll(async () => {
        getStub.mockResolvedValue({
          code: 200,
          config: { url: mockConfigMap.AUTH_DOMAIN },
          headers: {
            'member-jwt': mockJwt,
          },
        });
        await authentication(mockConfig)(mockContext, mockNext);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call Session-Service', () => {
        expect(axios.get).toHaveBeenCalledWith('/session/validate', {
          proxy: undefined,
          headers: {
            'session-id': '',
          },
        });
      });

      it('should call next', () => {
        expect(mockNext).toHaveBeenCalled();
      });
    });

    describe('when session-service returns a non 200', () => {
      const mockContext: Context = {
        ...baseContext,
        ...contextCookies,
        contract: mockOptionalAuthSpec,
      } as unknown as Context;

      let errorThrown: Error;

      beforeAll(async () => {
        try {
          getStub.mockRejectedValue({
            response: { status: 401 },
            message: 'authentication_failed',
            config: { url: mockConfigMap.AUTH_DOMAIN },
          });
          await authentication(mockConfig)(mockContext, mockNext);
        } catch (error) {
          errorThrown = error as Error;
        }
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should set memberAuthSuccess to be false', () => {
        expect(mockContext.memberAuthSuccess).toBe(false);
      });

      it('it should throw the original error', () => {
        expect(errorThrown).not.toBeInstanceOf(ServiceKitApplicationError);
      });
    });
  });

  describe('when auth is enabled and required', () => {
    describe('when session-id is given', () => {
      const mockContext: Context = {
        ...baseContext,
        ...contextCookies,
        contract: mockAuthRequiredSpec,
      } as unknown as Context;

      beforeAll(async () => {
        getStub.mockResolvedValue({
          code: 200,
          config: { url: mockConfigMap.AUTH_DOMAIN },
          headers: {
            'member-jwt': mockJwt,
          },
        });
        await authentication(mockConfig)(mockContext, mockNext);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call session-service', () => {
        expect(axios.get).toHaveBeenCalledWith('/session/validate', {
          proxy: undefined,
          headers: {
            'session-id': 'mocked-session-id',
          },
        });
      });

      it('should call next', () => {
        expect(mockNext).toHaveBeenCalled();
      });
    });

    describe('when session-service returns a non 200', () => {
      const mockContext: Context = {
        ...baseContext,
        ...contextCookies,
        contract: mockAuthRequiredSpec,
      } as unknown as Context;
      let errorThrown: Error;

      beforeAll(async () => {
        try {
          getStub.mockRejectedValue({
            response: { status: 401 },
            message: 'authentication_failed',
            config: { url: mockConfigMap.AUTH_DOMAIN },
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

      it('should throw a ServiceKitCustomHttpError', () => {
        expect(errorThrown).toBeInstanceOf(ServiceKitHttpError);
        expect(errorThrown).toHaveProperty('status', 401);
      });
    });

    describe('when session-service times out', () => {
      const mockContext: Context = {
        ...baseContext,
        ...contextCookies,
        contract: mockAuthRequiredSpec,
      } as unknown as Context;

      let errorThrown: Error;

      beforeAll(async () => {
        try {
          getStub.mockRejectedValue({
            message: 'authentication_timeout',
            config: { url: mockConfigMap.AUTH_DOMAIN },
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

      it('should return the expected error payload', () => {
        expect(errorThrown).toBeInstanceOf(ServiceKitHttpError);
      });
    });

    describe('when session-service returns a different memberId', () => {
      const mockContext: Context = {
        ...baseContext,
        headers: {
          'client-memberid': '123',
          'client-authtoken': 'mock-auth-token',
          'member-jwt': 'mock-jwt',
        },
        ...contextCookies,
        contract: mockAuthRequiredSpec,
      } as unknown as Context;

      let errorThrown: Error;

      beforeAll(async () => {
        getStub.mockResolvedValue({
          code: 200,
          config: { url: mockConfigMap.AUTH_DOMAIN },
          headers: {
            'member-jwt': mockJwt,
          },
        });

        try {
          await authentication(mockConfig)(mockContext, mockNext);
        } catch (e) {
          errorThrown = e as Error;
        }
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should NOT call next', () => {
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should throw a ServiceKitCustomHttpError', () => {
        expect(errorThrown).toBeInstanceOf(ServiceKitHttpError);
        expect(errorThrown).toHaveProperty('status', 401);
      });
    });

    describe('when memberid is not defined', () => {
      const mockContext: Context = {
        headers: {
          'member-jwt': 'mock-jwt',
        },
        ...contextCookies,
        contract: mockAuthRequiredSpec,
      } as unknown as Context;
      let errorThrown: Error;

      beforeAll(async () => {
        try {
          getStub.mockResolvedValue({
            code: 200,
            config: { url: mockConfigMap.AUTH_DOMAIN },
            headers: {
              'member-jwt': mockJwt,
            },
          });
          await authentication(mockConfig)(mockContext, mockNext);
        } catch (error) {
          errorThrown = error as Error;
        }

      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should NOT call next', () => {
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('it should throw the original error', () => {
        expect(errorThrown).not.toBeInstanceOf(ServiceKitApplicationError);
      });
    })
  });

  describe('when a non-auth related error is caught', () => {
    const mockContext: Context = {
      ...baseContext,
      ...contextCookies,
      contract: mockAuthRequiredSpec,
    } as unknown as Context;
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

  describe('when proxy is not defined', () => {
    const mockContext: Context = {
      ...baseContext,
      ...contextCookies,
      contract: mockAuthRequiredSpec,
    } as unknown as Context;

    beforeAll(async () => {
      mockConfigMap.PP_PROXY_ENABLED = false;
      getStub.mockResolvedValue({
        code: 200,
        config: { url: mockConfigMap.AUTH_DOMAIN },
        headers: {
          'member-jwt': mockJwt,
        },
      });
      await authentication(mockConfig)(mockContext, mockNext);
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call session-service with no proxy', () => {
      expect(axios.get).toHaveBeenCalledWith('/session/validate', {
        headers: {
          'session-id': 'mocked-session-id',
        },
      });
    });
  });

  describe('when proxy is defined', () => {
    const mockContext: Context = {
      ...baseContext,
      ...contextCookies,
      contract: mockAuthRequiredSpec,
    } as unknown as Context;

    beforeAll(async () => {
      client.defaults.baseURL = undefined;
      mockConfigMap.PP_PROXY_ENABLED = true;
      getStub.mockResolvedValue({
        code: 200,
        config: { url: mockConfigMap.AUTH_DOMAIN },
        headers: {
          'member-jwt': mockJwt,
        },
      });
      await authentication(mockConfig)(mockContext, mockNext);
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call session-service with proxy', () => {
      expect(axios.get).toHaveBeenCalledWith('/session/validate', {
        headers: {
          'session-id': 'mocked-session-id',
        },
        proxy: {
          host: 'test.com',
          port: 1234,
          protocol: 'http',
        },
      });
    });
  });
});
