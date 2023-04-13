import https from 'https';
import fs from 'fs';
import path from 'path';
import { config } from '@service-kit/core';

const nodeEnv = config.get(
  'env'
);

const ppEnabled = config.get(
  'PP_PROXY_ENABLED'
);

const certs = nodeEnv === 'development' && path.resolve(
  __dirname,
  ppEnabled ? '../../../deployment/GNL-Certificate-Authority.crt' : '../../../deployment/Gamesys-Root-CA.crt'
);

const localHttpsAgent = nodeEnv === 'development' && new https.Agent({
  ca: fs.readFileSync(certs)
});

export default localHttpsAgent;

