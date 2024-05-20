import { AxiosError, AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';
import { ServiceKitHttpError } from '../../src/ServiceKitHttpError';

const axiosError: AxiosError = {
  name: 'AxiosError',
  isAxiosError: true,
  message: 'test-error',
  config: {
    method: 'get',
    headers: {} as AxiosRequestHeaders,
    params: {},
    baseURL: 'test'
  },
  response: {
    data: null,
    status: 404,
    statusText: 'NOT_FOUND',
    headers: {},
    config: {} as InternalAxiosRequestConfig
  },
  toJSON: jest.fn()
};

describe('ServiceKitHttpError', () => {
  it('should have default error properties', () => {
    const errorObject = new ServiceKitHttpError(axiosError.message, axiosError);

    expect(errorObject).toHaveProperty('message', axiosError.message);
    expect(errorObject).toHaveProperty('stack');
  });

  it('should be able to add extra data as context to errors', () => {
    const errorObject = new ServiceKitHttpError(axiosError.message, axiosError);

    expect(errorObject).toHaveProperty('status', axiosError.response?.status);
  });

  describe('when AXIOS RESPONSE CODE details provided', () => {
    it('should have default error properties and details', () => {
      axiosError.code = 'ECONNABORTED';
      axiosError.config = { url: '/url', headers: {} as AxiosRequestHeaders };

      const errorObject = new ServiceKitHttpError(axiosError.message, axiosError);

      expect(errorObject).toHaveProperty('message', axiosError.message);
      expect(errorObject).toHaveProperty('status', 404);
    });
  });

  describe('when code is CERTS ISSUE', () => {
    it('should have correct status and properties', () => {
      axiosError.code = 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY';

      const errorObject = new ServiceKitHttpError(axiosError.message, axiosError);

      expect(errorObject).toHaveProperty('message', axiosError.message);
      expect(errorObject).toHaveProperty('status', 495);
    });
  });

  describe('when response is not provided', () => {
    it('should have default error properties and details', () => {
      const err = JSON.parse(JSON.stringify({ message: 'test', config: {}, response: {} }));

      const errorObject = new ServiceKitHttpError(err.message, err);

      expect(errorObject).toHaveProperty('message', err.message);
      expect(errorObject).toHaveProperty('status', 500);
    });
  });
});
