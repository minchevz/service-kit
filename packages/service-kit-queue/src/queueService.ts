import { ConnectionOptions, IQueueName, IQueueClient, IQueueConfig } from '@service-kit/common';
import { redis } from '@service-kit/redis';
import { Queue as QueueMQ } from 'bullmq';

export const createQueueMQ = async (
  queueNames: IQueueName,
  queueConfig: IQueueConfig
): Promise<IQueueClient> => {
  const commonConfig = {
    removeOnComplete: {
      age: queueConfig.QUEUE_REMOVE_ON_COMPLETE_AGE,
      count: queueConfig.MAX_NUMBER_OF_JOBS_ON_DASHBOARD
    },
    removeOnFail: {
      age: queueConfig.QUEUE_REMOVE_ON_FAIL_AGE
    }
  };
  const allQueuesHandler: Record<string, QueueMQ> = {};

  for (const key in queueNames) {
    if (queueNames[key]) {
      allQueuesHandler[queueNames[key]] = new QueueMQ(queueNames[key], {
        connection: redis as ConnectionOptions,
        ...commonConfig
      });
    }
  }

  return allQueuesHandler;
};
