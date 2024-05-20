import { StatusCodes } from '@service-kit/core';

const healthCheckResult = {
  service: 'example',
  status: 0
};

const checkService = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      healthCheckResult.status = StatusCodes.OK;

      resolve(healthCheckResult);
    }, 500);
  });

export const example = async (): Promise<string> => {
  const result = await checkService();

  return JSON.stringify(result);
};
