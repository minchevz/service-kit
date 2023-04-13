import { AxiosRequestConfig } from 'axios';
export class ServiceKitCustomHttpError extends Error {
  isAxiosError = true;
  config: AxiosRequestConfig;
  response: Record<string, unknown>;

  constructor(message: string, status = 500, config: AxiosRequestConfig = {}) {
    super(message);

    Error.captureStackTrace(this, ServiceKitCustomHttpError);

    this.name = 'ServiceKitCustomHttpError';
    this.response = { status };
    this.config = config;
  }
}
