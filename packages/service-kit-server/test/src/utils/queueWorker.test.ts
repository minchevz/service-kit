import * as workerUtil from '../../../src/utils/queueWorkers';
import { IQueueJobResponse, IQueueWorkerMapping } from '@service-kit/common';
import { Job, Worker } from 'bullmq';
import { redis } from '@service-kit/redis';
import path from 'path';
jest.mock('@service-kit/redis');

jest.mock('bullmq', () => ({
  Worker: jest.fn()
}));

describe('loadQueueWorkersUtil', () => {
  const workerConfig = {
    CONCURRENCY: 10,
    WORKER_REMOVE_ON_COMPLETE_AGE: 3600,
    WORKER_REMOVE_ON_FAIL_AGE: 3600
  };

  describe('createWorkerMQ', () => {
    it('should create workers for all valid queues', async () => {
      const myWorkerFunction = async (jobData: Job): Promise<IQueueJobResponse> => ({
        queueMetaData: jobData.data,
        status: 'success'
      });

      const queueWorkerMapping: IQueueWorkerMapping = {
        queue_1: myWorkerFunction,
        queue_2: myWorkerFunction
      };

      await workerUtil.createWorkerMQ(queueWorkerMapping, workerConfig);

      expect(Worker).toHaveBeenCalledTimes(2);
      expect(Worker).toHaveBeenCalledWith('queue_1', myWorkerFunction, {
        connection: redis,
        concurrency: 10,
        removeOnComplete: {
          age: 3600
        },
        removeOnFail: {
          age: 3600
        }
      });
      expect(Worker).toHaveBeenCalledWith('queue_2', myWorkerFunction, {
        connection: redis,
        concurrency: 10,
        removeOnComplete: {
          age: 3600
        },
        removeOnFail: {
          age: 3600
        }
      });
    });
  });

  describe('Worker loader', () => {
    const paths = [ path.resolve(__dirname, '../../mocks/mockListenerDir/') ];

    afterEach(() => jest.resetAllMocks());
    const workerConfig = {
      CONCURRENCY: 10,
      WORKER_REMOVE_ON_COMPLETE_AGE: 3600,
      WORKER_REMOVE_ON_FAIL_AGE: 3600
    };

    jest.spyOn(workerUtil, 'createWorkerMQ');

    it('loads and creates worker MQ correctly', async () => {
      const resp = await workerUtil.loadQueueWorkersUtil(paths, workerConfig);

      expect(resp).toBeUndefined();
      expect(workerUtil.createWorkerMQ).toBeCalledTimes(2);
    });
  });
});
