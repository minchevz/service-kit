import { createQueueMQ } from './src/queueService';
import { IConfig, ILogger, IQueueName, IQueueClient, IQueueConfig } from '@service-kit/common';

export let queue: IQueueClient;
export const bootstrap = async (config: IConfig, logger: ILogger): Promise<IQueueClient> => {
  logger.info('Initilizing Queue');

  const queueNames: IQueueName = config.get('QUEUE_NAMES');
  const queueConfig: IQueueConfig = config.get('QUEUE_CONFIG');

  queue = await createQueueMQ(queueNames, queueConfig);

  return queue;
};

export default {
  name: 'queue',
  dependencies: [ 'redis' ],
  bootstrap
};
