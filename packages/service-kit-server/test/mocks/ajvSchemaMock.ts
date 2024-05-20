import { IAjvSchema } from '../../types';

const mockValidate = () => () => true;

const ajvSchemaMock: IAjvSchema = {
  '/v1/dummy/:id': {
    get: {
      parameters: {
        errors: null
      },
      responses: {
        '200': {
          errors: null
        }
      }
    }
  },
  '/dummy/:id': {
    get: {
      parameters: {
        validate: mockValidate,
        errors: null
      },
      responses: {
        '200': {
          errors: null
        }
      }
    }
  },
  '/v1/dummy': {
    post: {
      body: {
        validate: mockValidate,
        errors: null,
        'application/json': {
          errors: null
        }
      },
      parameters: {
        errors: null
      },
      responses: {
        '201': {
          validate: mockValidate,
          errors: null
        }
      }
    }
  },
  '/dummy': {
    post: {
      body: {
        errors: null,
        'application/json': {
          errors: null
        }
      },
      parameters: {
        errors: null
      },
      responses: {
        '201': {
          errors: null
        }
      }
    }
  },
  '/v1/dummies/dummy': {
    get: {
      parameters: {
        errors: null
      },
      responses: {
        '200': {
          errors: null
        }
      }
    }
  },
  '/dummies/dummy': {
    get: {
      parameters: {
        validate: mockValidate,
        errors: null
      },
      responses: {
        '200': {
          errors: null
        }
      }
    }
  }
};

export default ajvSchemaMock;
