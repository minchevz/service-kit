/* eslint-disable @typescript-eslint/no-var-requires */
import { Context } from 'koa';
import { join } from 'path';

import { ControllerFunction, PromiseFunc } from '../../types';
import { INTERNAL_SERVER_ERROR, OK } from '../constants/statusCodes';

const FULFILLED = 'fulfilled';

export const loadController = (paths: string[], name: string): ControllerFunction | undefined => {
  const foundController = paths
    .map((path) => {
      try {
        const filePath = join(path, name);

        const controller = require(filePath);

        return controller.default || controller;
      } catch (error) {
        return undefined;
      }
    })
    .find(Boolean);

  return foundController;
};

export const executeFunctions = async (functions: PromiseFunc[], ctx: Context): Promise<void> => {
  const fetchFunctionResults = (functions: PromiseFunc[]) =>
    Promise.allSettled(functions.map(func => func()));

  try {
    const responses = await fetchFunctionResults(functions);
    const healthy = responses.every(res => res.status === FULFILLED);

    const formatted = responses.map(res => (res.status === FULFILLED ? res.value : res.reason));

    ctx.status = healthy ? OK : INTERNAL_SERVER_ERROR;
    ctx.body = { healthy, responses: formatted };
  } catch (error) {
    ctx.status = INTERNAL_SERVER_ERROR;
    ctx.body = {
      healthy: false,
      message: (error as { message: string }).message
    };
  }
};
