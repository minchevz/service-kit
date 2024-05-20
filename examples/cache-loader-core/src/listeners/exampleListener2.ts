import { IQueueJobResponse } from '@service-kit/common';
import { logger, modules } from '@service-kit/core';
import { Job } from 'bullmq';

const testWorker2 = async (jobData: Job): Promise<IQueueJobResponse> => {
  logger.info(`Test worker 2 data: ${JSON.stringify(jobData)}`);
  return { queueMetaData: jobData.data, status: 'success' };
};

const queueWorkerMap = { QUEUE_EXAMPLE_QUEUE_2: testWorker2 };

export { queueWorkerMap };
