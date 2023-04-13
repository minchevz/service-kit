import http from 'http';
import { Next } from 'koa';
import axios, { AxiosProxyConfig } from 'axios';
import xml2js from 'xml2js';
import { IConfig, ServiceKitHttpError } from '@service-kit/common';
import { Context } from '../../types';

export const AXIOS_TIMEOUT_CODE = 'ECONNABORTED';
export const client = axios.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  headers: { 'Content-Type': 'application/xml' },
  validateStatus: status => status === 200 // only accept a 200 status code
});

let proxy: AxiosProxyConfig;

export const authentication =
  (config: IConfig) =>
    async (context: Context, next: Next): Promise<void> => {
      if (!context.contract.authEnabled) {
        return await next();
      }

      const authRequired = context.contract.authRequired !== false;
      const { 'client-memberid': memberId, 'client-authtoken': authToken } = context.headers;

      if (!client.defaults.baseURL) {
        client.defaults.baseURL = config.get('AUTH_DOMAIN');
        client.defaults.timeout = config.get('AUTH_TIMEOUT');
        proxy = config.get('PP_PROXY_ENABLED') ? config.get('PROXY_CONFIG') : undefined;
      }
      const authenticationUrl = `/rest/chimera/${ memberId }/token/${ authToken }`;

      try {
        const auth = await client.get(authenticationUrl, { proxy });
        const authData = await xml2js.parseStringPromise(auth.data, { explicitArray: false });

        context.memberAuthSuccess = true;
        context.memberAuthToken = authData.token;
      } catch (error) {
        if (authRequired) {
          throw new ServiceKitHttpError(error.message, error);
        }

        context.memberAuthSuccess = false;
      }

      return await next();
    };

export default authentication;
