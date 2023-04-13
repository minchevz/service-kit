const baseSchema = {
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'production',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 5001,
    env: 'PORT',
    arg: 'port'
  },
  name: {
    doc: 'The application name.',
    format: '*',
    default: 'app',
    env: 'APP_NAME'
  },
  APP_VERSION: {
    doc: 'The application name.',
    default: '1.0.0',
    env: 'APP_VERSION'
  },
  logPath: {
    doc: 'The path for logs.',
    format: '*',
    default: './logs/app.log',
    env: 'LOG_PATH'
  },
  logLevel: {
    doc: 'The level of logging.',
    format: ['trace', 'debug', 'info', 'warn', 'error'],
    default: 'info',
    env: 'LOG_LEVEL'
  },
  PP_PROXY_ENABLED: {
    doc: 'The proxy setting for pp environment domains.',
    default: false,
    env: 'PP_PROXY_ENABLED'
  },
  PROXY_CONFIG: {
    host: '10.149.16.141',
    port: 3546,
    protocol: 'http'
  },
  EVENT_LOOP_DELAY: {
    doc: 'Event loop delay ticks',
    default: 42,
    env: 'EVENT_LOOP_DELAY'
  },
  HEAP_USED_BYTES: {
    doc: 'Event loop delay ticks',
    default: 0,
    env: 'HEAP_USED_BYTES'
  },
  RSS_BYTES: {
    doc: 'Event loop delay ticks',
    default: 0,
    env: 'RSS_BYTES'
  }
};

export default baseSchema;
