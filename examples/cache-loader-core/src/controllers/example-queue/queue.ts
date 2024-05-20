import { Context } from '@service-kit/server';
import { queue } from '@service-kit/queue';
import { index2 } from '../../services/MyService';

export default async (context: Context) => {
  const { cacheKey } = context.request.body;
  const data = await queue.QUEUE_EXAMPLE_QUEUE_1.add(
    'test-data',
    { data: context.request.body },
    { jobId: cacheKey }
  );
  index2();
  await queue.QUEUE_EXAMPLE_QUEUE_2.add('test', { data: new Date() });

  context.status = 200;
  context.body = {
    data
  };
};
