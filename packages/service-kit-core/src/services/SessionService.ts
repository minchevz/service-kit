import http from 'http';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { IConfig, ILogger, ServiceKitHttpError } from '@service-kit/common';

export const AXIOS_TIMEOUT_CODE = 'ECONNABORTED';
export let logger: ILogger;
export let client: AxiosInstance;

export const buildSessionClient = (appConfig: IConfig, appLogger: ILogger): void => {
  logger = appLogger;

  client = axios.create({
    httpAgent: new http.Agent({ keepAlive: true }),
    headers: { 'Content-Type': 'application/xml' },
    timeout: 1000,
    validateStatus: (status: number) => status === 200,
    ...(appConfig.get('PP_PROXY_ENABLED') && { proxy: appConfig.get('PROXY_CONFIG') }),
  });
};

export async function authenticate(
  baseUrl: string,
  sessionID: string,
  options?: AxiosRequestConfig
): Promise<string> {
  if (!baseUrl) {
    logger.warn('Session Host config is not defined!');
  }

  const authenticationUrl = `${ baseUrl }/session/validate`;

  try {
    const response = await client.get(authenticationUrl, {
      ...options,
      headers: { 'session-id': sessionID },
    });

    return response.headers['member-jwt'];
  } catch (error) {
    throw new ServiceKitHttpError(`Session Service: ${ error.message }`, error);
  }
}
