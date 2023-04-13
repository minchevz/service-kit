import { StatusCodes } from '@service-kit/server';
import { modules } from '@service-kit/core';

const { OK, SERVICE_UNAVAILABLE } = StatusCodes;
const service = 'redis';

const successResponsePayload = {
  service,
  status: OK,
  healthCheck: true,
  message: `${service} is ok`
};

let failedResponsePayload = {
  ...successResponsePayload,
  ...{
    status: SERVICE_UNAVAILABLE,
    healthCheck: false,
    message: `${service} is not ok`
  }
};

export const redis = (): Promise<string> =>
  new Promise(async (resolve, reject) => {
    let isRedisAvailable = false;
    try {
      isRedisAvailable = (await modules.redis.ping()) === 'PONG';
    } catch (error) {
      failedResponsePayload.message = `${failedResponsePayload.message} - ${error.message}`;
    }

    isRedisAvailable
      ? resolve(JSON.stringify(successResponsePayload))
      : reject(JSON.stringify(failedResponsePayload));
  });
