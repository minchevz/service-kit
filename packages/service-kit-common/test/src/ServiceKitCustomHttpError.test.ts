import { ServiceKitCustomHttpError } from '../../src/ServiceKitCustomHttpError';

describe('ServiceKitCustomHttpError', () => {
  it('should have default error properties', () => {
    const errorObject = new ServiceKitCustomHttpError('test');

    expect(errorObject).toHaveProperty('message', 'test');
    expect(errorObject).toHaveProperty('response', { status : 500 });
    expect(errorObject).toHaveProperty('config', {});
    expect(errorObject).toHaveProperty('stack');
  });

  it('should set correct status', () => {
    const errorObject = new ServiceKitCustomHttpError('test', 404);

    expect(errorObject).toHaveProperty('message', 'test');
    expect(errorObject).toHaveProperty('response', { status: 404 });
  });

  it('should be able to add extra data as context to errors', () => {
    const errorObject = new ServiceKitCustomHttpError('test', 401, { baseURL: 'test' });

    expect(errorObject).toHaveProperty('message', 'test');
    expect(errorObject).toHaveProperty('response', { status: 401 });
    expect(errorObject).toHaveProperty('config', { baseURL: 'test' });
  });
});
