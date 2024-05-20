import { KoaAdapter } from '@bull-board/koa';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { Queue as QueueMQ } from 'bullmq';
import Koa from 'koa';
import { loadQueueWorkersUtil } from '../../utils/queueWorkers';
import { IWorkerConfig } from '@service-kit/common';
const serverAdapter = new KoaAdapter();

export const createQueueDashboard = async (allQueues: QueueMQ[], app: Koa): Promise<void> => {
  const queueAdaptor = allQueues.map(async (queue: QueueMQ) => new BullMQAdapter(queue));

  const allQueueAdaptors = await Promise.all(queueAdaptor);

  createBullBoard({
    queues: [ ...allQueueAdaptors ],
    serverAdapter,
    options: {
      uiConfig: {
        boardTitle: 'QUEUE DASHBOARD'
      }
    }
  });
  serverAdapter.setBasePath('/admin');
  app.use(serverAdapter.registerPlugin());
};

export default async (
  queueWorkerPaths: string[],
  queues: QueueMQ[],
  app: Koa,
  workerConfig: IWorkerConfig
): Promise<void> => {
  createQueueDashboard(queues, app);
  await loadQueueWorkersUtil(queueWorkerPaths, workerConfig);
};
