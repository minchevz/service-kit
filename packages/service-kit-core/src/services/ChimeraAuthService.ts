import http from 'http';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import xml2js from 'xml2js';
import { IConfig, ILogger, ServiceKitHttpError } from '@service-kit/common';
interface IChimeraAuthToken {
  memberId: string;
  username: string;
  passwordHash: string;
  ventureName: string;
  partnerName: string;
  partnerId: string;
  memberStop: string;
  geoLocationToken: string;
  [index: string]: string;
}

export const AXIOS_TIMEOUT_CODE = 'ECONNABORTED';
export let logger: ILogger;
export let client: AxiosInstance;

export const buildChimeraClient = (appConfig: IConfig, appLogger: ILogger): void => {
  logger = appLogger;

  client = axios.create({
    httpAgent: new http.Agent({ keepAlive: true }),
    headers: { 'Content-Type': 'application/xml' },
    timeout: 1000,
    validateStatus: (status: number) => status === 200,
    ...(appConfig.get('PP_PROXY_ENABLED') && { proxy: appConfig.get('PROXY_CONFIG') })
  });
};

interface ChimeraParams {
  memberId: number;
  authToken: string;
}

export async function authenticate(
  baseUrl: string,
  params: ChimeraParams,
  options?: AxiosRequestConfig
): Promise<IChimeraAuthToken> {
  if (!baseUrl) {
    logger.warn('Chimera Host config is not defined!');
  }

  const { memberId, authToken } = params;
  const authenticationUrl = `${ baseUrl }/rest/chimera/${ memberId }/token/${ authToken }`;

  try {
    const auth = await client.get(authenticationUrl, options);
    const { token } = await xml2js.parseStringPromise(auth.data, { explicitArray: false });

    return token;
  } catch (error) {
    throw new ServiceKitHttpError(`Chimera: ${ error.message }`, error);
  }
}
