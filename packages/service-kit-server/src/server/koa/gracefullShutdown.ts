import http, { Server } from 'http';
import Koa from 'koa';
import { createTerminus, TerminusOptions } from '@godaddy/terminus';
import { ILogger, LogMethod } from '@service-kit/common';

let logger: ILogger;

export function onSignal(): Promise<boolean> {
  logger.warn('App is starting cleanup!');

  return Promise.resolve(true);
}

export function beforeShutdown<T>(): Promise<T> {
  // given your readiness probes run every 5 second
  // may be worth using a bigger number so you won't
  // run into any race conditions
  return new Promise((resolve) => {
    setTimeout(resolve, 5000);
  });
}

export function onShutdown(): Promise<boolean> {
  logger.warn('Cleanup finished, App is gracefully shutting down!');

  return Promise.resolve(true);
}

export const options = (logger: LogMethod, nodeEnv?: string): TerminusOptions => ({
  statusOk: 200,
  // cleanup options
  timeout: 5000, // [optional = 1000] number of milliseconds before forceful exiting
  signals: [ 'SIGINT', 'SIGTERM', 'unhandledRejection', 'uncaughtException' ],
  logger,
  onSignal, // [optional = []] array of signals to listen for relative to shutdown
  onShutdown, // [optional] called right before exiting
  ...(nodeEnv === 'production' && { beforeShutdown }) // [optional] called before the HTTP server starts its shutdown
});

const gracefullShutdown = (app: Koa, appLogger: ILogger): Server => {
  logger = appLogger;
  const appServer = http.createServer(app.callback());

  createTerminus(appServer, options(appLogger.warn, process.env.NODE_ENV));

  return appServer;
};

export default gracefullShutdown;
