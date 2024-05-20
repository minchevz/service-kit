import { IQueueJobResponse } from '@service-kit/common';
import { config, logger, modules } from '@service-kit/core';
import { Job } from 'bullmq';
import { index1 } from '../services/MyService';
const testWorker = async (jobData: Job): Promise<IQueueJobResponse> => {
  logger.info(`Test worker 1 data: ${JSON.stringify(jobData)}`);
  index1();
  return { queueMetaData: jobData.data, status: 'success' };
};

const queueWorkerMap = { QUEUE_EXAMPLE_QUEUE_1: testWorker };

export { queueWorkerMap };
