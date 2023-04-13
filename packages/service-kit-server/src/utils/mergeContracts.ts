import * as yaml from 'js-yaml';
import fs from 'fs';
import { ISwaggerSpec } from '../interfaces/contract-interfaces';
import { ILogger } from '@service-kit/common';
const writeContractInYml = async (allContracts: ISwaggerSpec, contractPath: string) => {
  fs.writeFileSync(contractPath, yaml.dump(allContracts), 'utf8');
};

export const flattenContracts = async (contract: ISwaggerSpec, logger: ILogger) => {
  const contactPathCommonIndex = process.argv.indexOf('--contract-path');

  if (
    contactPathCommonIndex > 0 && // check if --contract-path is in argument or not.
    process.argv.length >= contactPathCommonIndex + 1 && // check if anything id passed after --contract-path command
    (process.argv[contactPathCommonIndex + 1].endsWith('.yml') ||
      process.argv[contactPathCommonIndex + 1].endsWith('.yaml'))
  ) {
    await writeContractInYml(contract, process.argv[contactPathCommonIndex + 1]);
    logger.info(`Success:: contract path ${ process.argv[contactPathCommonIndex + 1] }`);
    process.exit(0);
  } else {
    logger.info(`No merging`);
  }
};
