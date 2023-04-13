import { ServiceKitApplicationError } from '../../src/ServiceKitApplicationError';

describe('ServiceKitApplicationError', () => {
  it('should have default error properties', () => {
    const errorObject = new ServiceKitApplicationError('test');

    expect(errorObject).toHaveProperty('message', 'test');
    expect(errorObject).toHaveProperty('status', 500);
    expect(errorObject).toHaveProperty('stack');
  });

  it('should be able to add extra data as context to errors', () => {
    const errorObject = new ServiceKitApplicationError('test', { baseURL: 'test' });

    expect(errorObject).toHaveProperty('message', 'test');
    expect(errorObject).toHaveProperty('status', 500);
    expect(errorObject).toHaveProperty('request', { baseURL: 'test' });
  });
});
