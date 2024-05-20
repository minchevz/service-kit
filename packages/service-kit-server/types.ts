import Koa, { Next, DefaultState, DefaultContext, Middleware } from 'koa';
import Router from '@koa/router';
import { IRoute } from './src/interfaces/contract-interfaces';
import { Server } from 'http';
import { Queue as QueueMQ } from 'bullmq';
import { JwtPayload } from 'jsonwebtoken';

export interface Context extends Koa.Context {
  errors: IErrorMap;
  contract: IRoute;
  memberAuthSuccess?: boolean;
  memberAuthToken?: ISessionToken | IChimeraAuthToken;
}

export interface ISessionToken extends JwtPayload {
  memberId: number;
  ventureName: string;
  loginId: string;
}

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

type KoaControllerResult = Promise<void> | void;
type PlainControllerFunction = (ctx: Koa.Context, next?: Next) => KoaControllerResult;

export type PromiseFunc = () => Promise<string | Record<string, unknown>>;
export interface ControllerFunction {
  // Call signatures
  (ctx: Context, next?: Next): KoaControllerResult;
  (healthChecks: PromiseFunc[]): PlainControllerFunction;
  (healthChecks: PromiseFunc[], externalChecks: PromiseFunc[]): PlainControllerFunction;
}
export interface ServerOptions {
  contractPaths: string[];
  controllerPaths?: string[];
  errorDirectories?: string[];
  healthChecks?: PromiseFunc[];
  externalChecks?: PromiseFunc[];
  additionalMiddleware?: Middleware[];
  queues?: QueueMQ[];
  queueWorkerPaths?: string[];
}

export interface ServerExport {
  listen: (port?: number) => Promise<Server>;
}

export interface ICtxRequestParams extends IRequestParams {
  method: Method;
}

export interface IRequestParams {
  headers?: IRequestObject;
  params?: IRequestObject;
  query?: IRequestObject;
  body?: IRequestObject;
  files?: IRequestObject;
}

export type Method = 'get' | 'post' | 'put' | 'delete' | 'options' | 'head' | 'patch';

// Ajv schema validator types
export interface IAjvSchema {
  [key: string]: IAjvSchemaPath;
}
interface IAjvSchemaPath {
  [key: string]: ISchemaProperties;
}

export interface ISchemaProperties {
  body?: ISimpleValidator | IValidator;
  parameters: ISimpleValidator | IValidator;
  responses?: ISchemaResponse;
}
interface ISchemaResponse {
  [key: string]: Record<string, unknown>;
}

interface ISimpleValidator {
  validate?(data: IRequestObject | undefined): () => boolean;
  errors?: null;
}
type IValidator = ISimpleValidator & {
  [key: string]: Record<string, unknown>;
};

export interface IRequestObject {
  [key: string]: IRequestObject | [] | string | string[] | number | boolean | null | undefined;
}

export interface IValidationError {
  name: string;
  message: string;
  status: number;
  instance: string;
}

export interface IError {
  message: string;
  http_code: number;
}

export interface IErrorMap {
  [code: string]: Record<string, IError>;
}

export interface IErrorDictionary {
  language_code: string;
  namespace?: string;
  errors: IErrorMap;
}

// URL validation types
type UriError = 'INVALID_PROTOCOL_ERROR' | 'Redirect Url Validation: Error: INVALID_URL_ERROR';

export interface IUriError extends Error {
  message: UriError;
}

export interface IParsedUrl {
  protocol?: string | null;
  hostname?: string | null;
  port?: string | null;
  query?: string | null;
  pathname: string | null;
  hash?: string | null;
}

export interface IUrlParams {
  encodedUriPath: string;
  protocol?: string | null;
  hostname?: string | null;
  port?: string | null;
}

export type ServerApp = Koa<DefaultState, DefaultContext>;

export type RouterApp = Router<DefaultState, Context>;

export type KoaServer = {
  app: ServerApp;
  router: RouterApp;
};
export interface IOpenApiError {
  message: string;
  expose: boolean;
  code: number;
  location: unknown;
  suggestions: Array<Record<string, unknown>>;
}
