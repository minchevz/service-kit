import { ServiceKitError } from '@service-kit/core';

export default (): void => {
  throw new ServiceKitError('calm', { extra: 'data' });
};
