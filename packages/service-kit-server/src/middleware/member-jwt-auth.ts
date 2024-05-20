import http from 'http';
import jwt from 'jsonwebtoken';

import { Next } from 'koa';
import axios, { AxiosProxyConfig } from 'axios';
import { IConfig, ServiceKitCustomHttpError, ServiceKitHttpError } from '@service-kit/common';
import { Context, ISessionToken } from '../../types';

export const AXIOS_TIMEOUT_CODE = 'ECONNABORTED';
export const client = axios.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  headers: { 'Content-Type': 'application/xml' },
  validateStatus: status => status === 200 // only accept a 200 status code
});

let proxy: AxiosProxyConfig;

export const memberJWTAuth =
  (config: IConfig) =>
    async (context: Context, next: Next): Promise<void> => {
      if (!context.contract.memberJwtAuth) {
        return await next();
      }

      const authRequired = context.contract.memberJwtAuthRequired !== false;
      const sessionId = context.cookies.get('SESSION-ID') || '';
      const memberId = context?.headers['client-memberid'] || '';

      if (!client.defaults.baseURL) {
        client.defaults.baseURL = config.get('AUTH_DOMAIN');
        client.defaults.timeout = config.get('AUTH_TIMEOUT');
        proxy = config.get('PP_PROXY_ENABLED') ? config.get('PROXY_CONFIG') : undefined;
      }
      const sessionServicePath = `/session/validate`;

      try {
        const session = await client.get(sessionServicePath, { 
          proxy,
          headers: { 'session-id' : sessionId }
        });

        const { 'member-jwt': jsonWebToken } = session.headers;

        const sessionToken = jwt.decode(jsonWebToken) as ISessionToken;

        if (memberId === sessionToken.memberId.toString()) {
          context.memberAuthSuccess = true;
          context.memberAuthToken = sessionToken;
        } else {
          throw new ServiceKitCustomHttpError('Invalid details', 401)
        }
      } catch (error) {
        if (authRequired) {
          throw new ServiceKitHttpError(error.message, error);
        }

        context.memberAuthSuccess = false;
      }

      return await next();
    };

export default memberJWTAuth;
