const config = {
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  host: {
    doc: 'The IP address to bind.',
    format: String,
    default: '127.0.0.1',
    env: 'APP_HOST'
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
  }
};

export default config;
