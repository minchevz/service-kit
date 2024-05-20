/* eslint-disable @typescript-eslint/no-explicit-any */
import { koaSwagger } from 'koa2-swagger-ui';

export default async function (uiVersions: Array<{ url: string; name: string }>): Promise<any> {
  return koaSwagger({
    routePrefix: '/versions',
    swaggerOptions: {
      swaggerVersion: '3.0.0',
      urls: uiVersions
    }
  });
}
