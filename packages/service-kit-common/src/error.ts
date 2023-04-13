const AXIOS_TIMEOUT_CODE = 'ECONNABORTED';
const AXIOS_ISSUER_CERT_CODE = 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY';

export interface HttpError {
  config?: {
    headers?: Record<string, string>;
    url?: string;
    baseURL?: string;
  };
  response?: {
    status: number;
  };
  code?: string;
}

export class ServiceKitError extends Error {
  status: number;
  operationalError: boolean;
  programmerError: boolean;
  details?: Record<string, unknown>;
  constructor(message = 'Unexpected error, something went wrong!', error?: HttpError | Error) {
    super(message);

    Error.captureStackTrace(this, ServiceKitError);

    this.name = 'ServiceKitError';
    const status = (error as HttpError)?.response?.status;

    this.operationalError = Boolean(status);
    this.programmerError = !Boolean(status);

    const httpError = error as HttpError;
    const isLocalCertError = httpError?.code === AXIOS_ISSUER_CERT_CODE;
    const isTimeoutError = httpError?.code === AXIOS_TIMEOUT_CODE;

    this.status = isLocalCertError ? 495 : status || 500;

    this.details = { isTimeoutError };
    if ((error as HttpError)?.response || (error as HttpError)?.code) {
      this.details = {
        ...this.details,
        baseUrl: httpError?.config?.baseURL,
        url: httpError?.config?.url,
        header: httpError?.config?.headers
      };
    }
  }
}
