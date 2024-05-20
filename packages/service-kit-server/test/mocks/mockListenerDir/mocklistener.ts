const testWorker = async (jobData: any): Promise<any> => ({
  queueMetaData: jobData.data,
  status: 'success'
});

const queueWorkerMap = { QUEUE_EXAMPLE_QUEUE_1: testWorker };

export { queueWorkerMap };
