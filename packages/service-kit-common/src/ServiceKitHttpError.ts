import { AxiosError } from 'axios';
export class ServiceKitHttpError extends Error {
  status: number;
  operationalError: boolean;
  programmerError: boolean;
  isAxiosError: boolean;
  details = {};
  request?: Record<string, unknown>;

  constructor(message: string, error: AxiosError) {
    super(message);

    Error.captureStackTrace(this, ServiceKitHttpError);

    this.name = 'ServiceKitHttpError';
    this.operationalError = Boolean(error.response?.status);
    this.programmerError = !Boolean(error.response?.status);

    const isCertsError = error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY';
    const isTimeoutError = error.code === 'ECONNABORTED';

    this.status = isCertsError ? 495 : error.response?.status || 500;
    this.details = error.response?.data || null;
    this.isAxiosError = error.isAxiosError || false;
    this.request = {
      isTimeoutError,
      ...error.response?.statusText && { statusText: error.response?.statusText },
      ...error.config?.baseURL && { baseUrl: error.config.baseURL },
      ...error.config?.url && { url: error.config.url },
      ...error.config?.headers && { headers: error.config.headers }
    };
  }
}

