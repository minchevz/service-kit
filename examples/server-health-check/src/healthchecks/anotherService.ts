import { StatusCodes } from '@service-kit/server';

const { OK, INTERNAL_SERVER_ERROR } = StatusCodes;
const responsePayload = {
  service: 'anotherService',
  status: 0,
  healthCheck: true
};

export const anotherService = (): Promise<string> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      responsePayload.service = 'anotherService';

      // 0.8 = 80% success rate, simulate 20% errors
      if (Math.random() <= 0.8) {
        responsePayload.status = OK;
        responsePayload.healthCheck = true;

        resolve(JSON.stringify(responsePayload));
      } else {
        responsePayload.status = INTERNAL_SERVER_ERROR;
        responsePayload.healthCheck = false;

        reject(JSON.stringify(responsePayload));
      }
    }, 500);
  });
