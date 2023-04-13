import { koaSwagger } from 'koa2-swagger-ui';
import swaggerUi from '../../../src/middleware/swaggerUi';

jest.mock('koa2-swagger-ui', () => ({ koaSwagger: jest.fn() }));

const uiVersions = [ { name: 'v1', url: 'http://localhost:4000/v1/example.yml' } ];

describe('Given the Open API Middleware', () => {
  afterEach(() => (koaSwagger as jest.Mock).mockReset());

  it('should call the open API with the correct params', async () => {
    await swaggerUi(uiVersions);

    expect(koaSwagger).toBeCalledTimes(1);
  });
});
