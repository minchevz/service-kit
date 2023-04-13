# @service-kit/logger

This package exports a function that will read in environment variables, sets specified logger config runs the winston logger. Utilises [Winston](https://github.com/winstonjs/winston) under the hood.

## Features

* Logger id set based on app id/name.
* DEV app environment runs with console.
* PRODUCTION app environment generates a log file logs in with config values.
* Sets colors for log types.

## Getting started

```sh
yarn add @service-kit/logger
```

After installing, execute the package and configure as necessary.

```js
import serviceKitLogger, { logger } from '@service-kit/logger';

serviceKitLogger({
  id: 'logger-example-id',
  name: 'logger-example-name',
  version: '1.0.0'
});

logger.info('This is an info message', { extra: 'data' });
logger.warn('This is a warning message', { get: 'ready' });
logger.error('This is an error message', { error: 'details' });

```
