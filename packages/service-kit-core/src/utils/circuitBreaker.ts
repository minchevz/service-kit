import { ILogger } from '@service-kit/common';
import CircuitBreaker from 'opossum';

type IBreakerFunction = (...args: never[]) => Promise<unknown>;
interface ICircuitOptions<IFallback> {
  circuitBreakers: Record<string, IBreakerFunction>;
  options?: CircuitBreaker.Options;
  fallback?: IFallback;
}

export const circuits = new Map();
const defaultOptions: CircuitBreaker.Options = {
  timeout: 3000, // If function takes longer than 3 seconds, trigger circuit!
  errorThresholdPercentage: 20, // When 20% of requests fail, trigger the circuit!
  resetTimeout: 30 // cycle period of 30 secs,after close and try again!
};

export const bootstrap = <IFallback>(
  logger: ILogger,
  { circuitBreakers, options = {}, fallback }: ICircuitOptions<IFallback>
) => {
  Object.keys(circuitBreakers).forEach((key: string) => {
    const circuit = new CircuitBreaker(circuitBreakers[key], { ...defaultOptions, ...options });

    circuits.set(key, circuit);
  });

  for (const [ key ] of circuits) {
    circuits.get(key).on('open', () => {
      logger.warn(`${ key } Circuit opened.Service is DOWN!`);
    });

    circuits.get(key).on('close', () => {
      logger.warn(`${ key } Circuit closed.Service is OK!`);
    });

    circuits.get(key).fallback(() => fallback && 'fallback');
  }
};

export async function run(name: string, ...args: Array<string | number>) {
  return await circuits.get(name).fire(...args);
}
