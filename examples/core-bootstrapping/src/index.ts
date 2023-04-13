import core, { modules } from '@service-kit/core';

const mockModule = {
  name: 'example',
  dependencies: [],
  bootstrap: async () => {
    console.log('Bootstrapping example module!');
    await Promise.resolve();
    console.log('Bootstrapping example complete!');

    return 'example';
  }
};

(async () => {
  try {
    console.log('Attempting to access "config" before initialisation...');
    const { config } = modules;

    config.getProperties();
  } catch (error) {
    // Will receive error: Error: Unable to access modules before bootstrapping
    console.log('==================');
    console.error('error', error.message);
    console.log('==================');
  }
  console.log('Initialising @service-kit/core module...');
  await core({
    id: 'core-bootstrapping',
    name: 'core-bootstrapping',
    configPaths: [`${__dirname}/config/config`],
    api: {
      contractPaths: [],
      controllerPaths: []
    },
    modules: [mockModule]
  });
  console.log('Accessing modules export...');
  const { config } = modules;

  console.log('==================');
  console.log('modules', Object.keys(modules));
  console.log('config.getProperties()', config.getProperties());
  console.log('==================');
})();
