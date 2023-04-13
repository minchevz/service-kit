import { ILogger } from '@service-kit/common';
import { ProtectionInstance } from 'overload-protection';

export default (logger: ILogger, message: ProtectionInstance | string) => {
  const details = `Server experiencing heavy load: ${ JSON.stringify(message) }`;
  const msg = typeof message === 'string' ? message : details;

  logger.warn(msg);
};
