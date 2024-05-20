import { IRequestObject, Method } from '../../types';

export interface ISwaggerServer {
  url: string;
  description: string;
}

export interface ISwaggerRoute {
  'x-controller': string;
  requestBody?: IRequestObject;
}

export interface IRoute {
  path: string;
  method: Method;
  controller?: string;
  details: ISwaggerRoute;
  authEnabled: boolean;
  authRequired: boolean;
  memberJwtAuth: boolean;
  memberJwtAuthRequired: boolean;
}

interface ISwaggerPath {
  get?: ISwaggerRoute;
  post?: ISwaggerRoute;
  put?: ISwaggerRoute;
  delete?: ISwaggerRoute;
  options?: ISwaggerRoute;
  head?: ISwaggerRoute;
  patch?: ISwaggerRoute;
}

export interface ISwaggerSpec {
  servers: ISwaggerServer[];
  paths: Record<string, ISwaggerPath>;
  components?: Record<string, unknown>;
}
