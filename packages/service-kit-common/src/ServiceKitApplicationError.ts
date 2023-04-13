export class ServiceKitApplicationError extends Error {
  status = 500;
  request?: Record<string, unknown>;

  constructor(message: string, data?: Record<string, unknown>) {
    super(message);

    Error.captureStackTrace(this, ServiceKitApplicationError);

    this.name = 'ServiceKitApplicationError';
    this.request = data;
  }
}
