/* eslint-disable @typescript-eslint/no-var-requires */
import { join } from 'path';
import fs from 'fs';

import { ConnectionOptions, IQueueWorkerMapping, IWorkerConfig } from '@service-kit/common';
import { redis } from '@service-kit/redis';
import { Worker } from 'bullmq';

export const createWorkerMQ = async (
  queueWorkerMapping: IQueueWorkerMapping,
  workerConfig: IWorkerConfig
): Promise<void> => {
  const config = {
    concurrency: workerConfig.CONCURRENCY,
    removeOnComplete: { age: workerConfig.WORKER_REMOVE_ON_COMPLETE_AGE },
    removeOnFail: { age: workerConfig.WORKER_REMOVE_ON_FAIL_AGE }
  };
  const queues = Object.entries(queueWorkerMapping).filter(
    ([ queueName, worker ]) => queueName && !!worker
  );

  await Promise.all(
    queues.map(
      ([ name, options ]) =>
        new Worker(name, options, { connection: redis as ConnectionOptions, ...config })
    )
  );
};

export const loadQueueWorkersUtil = async (paths: string[], workerConfig: IWorkerConfig) => {
  const allFiles = paths.flatMap((path) => {
    const files = fs.readdirSync(path);

    return files.map(file => join(path, file));
  });

  const allWorkerCallBackFunctions = allFiles.reduce((result, filePath) => {
    const workers = require(filePath);
    const workerCallBackFunctions: IQueueWorkerMapping = {};

    Object.entries(workers.queueWorkerMap as IQueueWorkerMapping).forEach(([ key, value ]) => {
      workerCallBackFunctions[key] = value;
    });

    return { ...result, ...workerCallBackFunctions };
  }, {});

  await createWorkerMQ(allWorkerCallBackFunctions, workerConfig);
};
