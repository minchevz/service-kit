import serviceKitLogger from '@service-kit/logger';

const logger = serviceKitLogger({
  id: 'logger-example-id',
  name: 'logger-example-name',
  version: '1.0.0'
});

logger.info('This is an info message', { extra: 'data' });
logger.warn('This is a warning message', { get: 'ready' });
logger.error('This is an error message', { error: 'details' });
