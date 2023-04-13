
import axios from 'axios';
import { config } from '@service-kit/core';
import supertest from 'supertest';
import SwaggerParser from '@apidevtools/swagger-parser';
import { Server } from 'http';
import server from '../../src/server';
import dotenv from 'dotenv';
import { OpenAPIV3 } from 'openapi-types';
import { ExampleMockedResponse } from '../fixtures/contract/exampleFixture';
import { matchersWithOptions } from 'jest-json-schema';

expect.extend(matchersWithOptions({
  verbose: true
}));

dotenv.config({ path: process.env.CONTRACT_TESTING_ENV_FILE_PATH || 'contract-test/.env' });

const PRISM_IP_ADDRESS = process.env.PRISM_IP_ADDRESS;
const PRISM_PORT_EXAMPLE_SERVICE = process.env.PRISM_PORT_EXAMPLE_SERVICE;

jest.mock('@service-kit/core', () => ({
  __esModule: true,
  default: jest.requireActual('@service-kit/core').default,
  StatusCodes: jest.requireActual('@service-kit/core').StatusCodes,
  ServiceKitError: jest.requireActual('@service-kit/core').ServiceKitError,
  logger: {
    error: () => jest.fn(),
    info: () => jest.fn()
  },
  config: {
    get: (key: string) => {
      switch (key) {
      case 'EXAMPLE_SERVICE_HOST':
        return `http://${ PRISM_IP_ADDRESS }:${ PRISM_PORT_EXAMPLE_SERVICE }`;
      default:
        return 0;
      }
    }
  }
}));

describe('Consumer Test', () => {
  describe('Example endpoint /endpoint ', () => {
    it('should return success and response should match required schema',
      async () => {
        const baseUrl = config.get('EXAMPLE_SERVICE_HOST');

        const mockedResponse = await axios.get(`${ baseUrl }/endpoint`, {
          headers: {
            'Accept-Language': 'en-GB'
          }
        });

        expect(mockedResponse.status).toEqual(200);
        expect(mockedResponse.data).toMatchSchema(ExampleMockedResponse);
      });
  });
});

describe('Contract Test as producer', () => {
  let httpServer: Server;
  let swaggerParserSettledResults:
    OpenAPIV3.Document;

  beforeAll(async () => {
    const app = await server();

    httpServer = await app.listen();

    swaggerParserSettledResults = <OpenAPIV3.Document> await SwaggerParser.validate('src/contract/v1/{{generated_file_id}}.yml');
  });

  afterAll(() => {
    httpServer.close();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('response should match with example provided in contract', async () => {
    const response = await supertest(httpServer).get(`/example/`);

    const schema = swaggerParserSettledResults?.components?.schemas?.ExampleResponse as OpenAPIV3.BaseSchemaObject;

    expect(response.status).toEqual(200);
    expect(response.body).toMatchSchema(schema);
    expect(schema.example).toMatchSchema(schema);
  });
});
