export default {
  language_code: 'en',
  errors: {
    calm: {
      message: 'Enhance your calm',
      http_code: 420
    },
    body_validation_error: {
      message: 'Validation error when validating request body',
      http_code: 400
    },
    parameter_validation_error: {
      message: 'Validation error when validating request parameters',
      http_code: 400
    },
    authentication_missing: {
      message: 'Authentication credentials missing',
      http_code: 401
    },
    authentication_failed: {
      message: 'Authentication failed',
      http_code: 401
    },
    authentication_timeout: {
      message: 'Authentication server failed to respond in time',
      http_code: 401
    },
    internal_error: {
      message: 'Internal server error',
      http_code: 500
    }
  }
};
