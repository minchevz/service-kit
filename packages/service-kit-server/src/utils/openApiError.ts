import { IOpenApiError } from '../../types';

export class OpenApiError extends Error {
  status: number;
  details = {};

  constructor(message: string, error: IOpenApiError) {
    super(message);

    Error.captureStackTrace(this, OpenApiError);

    this.name = 'OpenApiError';
    this.status = error.code;
    const reasons = error.suggestions?.map((val: Record<string, unknown>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { path, start, ...reason } = val;

      return reason.error;
    });

    this.details = {
      location: error.location,
      reasons
    };
  }
}
