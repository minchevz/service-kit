import { OpenApiError } from '../../../src/utils/openApiError';
import { IOpenApiError } from '../../../types';

const error: IOpenApiError = {
  message: 'test',
  expose: true,
  code: 400,
  location: { in: 'header' },
  suggestions: [ { path: '', start: '', error: 'reason' } ]
};

describe('OpenApiError', () => {
  it('should have default error properties', () => {
    const errorObject = new OpenApiError('test', error);

    expect(errorObject).toHaveProperty('message', 'test');
    expect(errorObject).toHaveProperty('status', error.code);
    expect(errorObject).toHaveProperty('stack');
    expect(errorObject).toHaveProperty('details', {
      location: {
        'in': 'header'
      },
      reasons: [ 'reason' ]
    });
  });
});
