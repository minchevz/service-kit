import { ServiceKitError } from '../../src/error';

describe('ServiceKitError', () => {
  it('should have default error properties', () => {
    const errorObject = new ServiceKitError('my-code');

    expect(errorObject).toHaveProperty('message', 'my-code');
    expect(errorObject).toHaveProperty('stack');
  });

  it('should be able to add extra data as context to errors', () => {
    const err = { response: { status: 503 } };

    const errorObject = new ServiceKitError('my-code', err);

    expect(errorObject).toHaveProperty('status', err.response.status);
  });

  describe('when message or status is undefined', () => {
    it('should have default error properties', () => {
      const errorObject = new ServiceKitError();

      expect(errorObject).toHaveProperty('message', 'Unexpected error, something went wrong!');
      expect(errorObject).toHaveProperty('status', 500);
      expect(errorObject).toHaveProperty('stack');
    });
  });

  describe('when AXIOS RESPONSE CODE details provided', () => {
    it('should have default error properties and details', () => {
      const err = {
        config: {
          url: '/url'
        },
        code: 'ECONNABORTED'
      };
      const errorObject = new ServiceKitError('test_error', err);

      expect(errorObject).toHaveProperty('message', 'test_error');
      expect(errorObject).toHaveProperty('status', 500);
      expect(errorObject).toHaveProperty('details', {
        isTimeoutError: true,
        url: '/url',
        baseUrl: undefined,
        header: undefined
      });
      expect(errorObject).toHaveProperty('stack');
    });

    describe('when code is CERTS ISSUE', () => {
      it('should have correct status and properties', () => {
        const err = {
          code: 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY'
        };
        const errorObject = new ServiceKitError('test_error', err);

        expect(errorObject).toHaveProperty('message', 'test_error');
        expect(errorObject).toHaveProperty('status', 495);
        expect(errorObject).toHaveProperty('operationalError', false);
        expect(errorObject).toHaveProperty('programmerError', true);
        expect(errorObject).toHaveProperty('details', {
          isTimeoutError: false,
          url: undefined,
          baseUrl: undefined,
          header: undefined
        });
        expect(errorObject).toHaveProperty('stack');
      });
    });
  });
});
