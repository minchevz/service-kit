import { logger, Context, CircuitBreaker } from '@service-kit/core';

const test1 = (ventureName: string, memberId: number): Promise<string> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(`circuit-1 : ${ventureName}-${memberId}`);
    }, 100);
  });

const test2 = (currency: string, ventureId: string): Promise<string> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(`circuit-2: ${currency}-${ventureId}`);
    }, 100);
  });

const test3 = (ventureId: string, id: number): Promise<string> =>
  new Promise((_, reject) => {
    setTimeout(() => {
      reject(`circuit-3 failed. ${ventureId}`);
    }, 100);
  });

CircuitBreaker.bootstrap<string>(logger, {
  circuitBreakers: {
    'circuit-1': test1,
    'circuit-2': test2,
    'circuit-3': test3
  },
  fallback: 'test fallback'
});

export default async (context: Context): Promise<void> => {
  logger.info('Accessing example controller');

  const res1 = await CircuitBreaker.run('circuit-1', 'jackpotjoy', 123);
  const res2 = await CircuitBreaker.run('circuit-2', 'GBP', 'virgingames');
  const res3 = await CircuitBreaker.run('circuit-3', 'jackpotjoy', 123);

  context.status = 200;
  context.body = {
    data: {
      1: res1,
      2: res2,
      3: res3
    }
  };
};
