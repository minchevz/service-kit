import CircuitBreaker from 'opossum';

jest.mock('opossum');
const spyWarn = jest.fn();
const logger = { warn: spyWarn };
const spyPromiseTest1 = async () => jest.fn();
const spyPromiseTest2 = async () => jest.fn();
const circuitBreakers = {
  name1: spyPromiseTest1,
  name2: spyPromiseTest2
};
const mockFallback = 'fallback';

describe('Given the CircuitBreaker utility', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let circuitBreaker: any;
  let spyFire1: jest.SpyInstance;
  let spyFire2: jest.SpyInstance;
  const err = new Error('test error');

  beforeAll(async () => {
    circuitBreaker = await require('../../../src/utils/circuitBreaker');
  });

  describe('when init function is called,', () => {
    beforeEach(async () => {
      circuitBreaker.bootstrap(logger, { circuitBreakers, fallback: mockFallback });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should create circuits size as many as defined', () => {
      expect(circuitBreaker.circuits.size).toBe(Object.keys(circuitBreakers).length);
    });

    it('should create CircuitBreaker instance as many as jackpot types', () => {
      expect(CircuitBreaker).toHaveBeenCalledTimes(Object.keys(circuitBreakers).length);
    });
  });

  describe('when run is called,', () => {
    beforeAll(async () => {
      spyFire1 = jest.spyOn(circuitBreaker.circuits.get('name1'), 'fire');
      spyFire2 = jest.spyOn(circuitBreaker.circuits.get('name2'), 'fire');
    });

    beforeEach(async () => {
      await circuitBreaker.run('name1', 'jackpotjoy', 'GBP');
      await circuitBreaker.run('name2', 'virgingames', 'GBP');
    });

    it('should call all jackpots breaker.fire', async () => {
      expect(spyFire1).toBeCalledTimes(1);
      expect(spyFire2).toBeCalledTimes(1);
    });
  });

  describe('and breaker is open,', () => {
    let spyOpen: jest.SpyInstance;

    beforeEach(async () => {
      circuitBreaker.bootstrap(logger, { circuitBreakers, fallback: mockFallback });
      spyOpen = jest.spyOn(circuitBreaker.circuits.get('name1'), 'on');
      const callback = spyOpen.mock.calls[0][1];

      callback(err, 1000, null);
    });

    it('should call necesary functions', async () => {
      expect(spyWarn).toHaveBeenLastCalledWith('name1 Circuit opened.Service is DOWN!');
    });
  });

  describe('and breaker is closed,', () => {
    let spyOpen: jest.SpyInstance;

    beforeEach(async () => {
      circuitBreaker.bootstrap(logger, { circuitBreakers, fallback: mockFallback });
      spyOpen = jest.spyOn(circuitBreaker.circuits.get('name1'), 'on');
      const callback = spyOpen.mock.calls[1][1];

      await callback(err, 1000, null);
    });

    it('should call necesary functions', async () => {
      expect(spyWarn).toHaveBeenLastCalledWith('name1 Circuit closed.Service is OK!');
    });
  });

  describe('and fallback is called,', () => {
    let spyOpen: jest.SpyInstance;

    beforeEach(async () => {
      spyOpen = jest.spyOn(circuitBreaker.circuits.get('name1'), 'fallback');
    });

    it('should return fallback response', async () => {
      const callback = spyOpen.mock.calls[0][0];

      await expect(callback()).toEqual(mockFallback);
    });
  });
});
