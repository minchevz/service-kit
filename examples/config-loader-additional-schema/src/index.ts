import configLoader from '@service-kit/config-loader';

const config = configLoader({
  configPaths: [`${__dirname}/config/client.json`, `${__dirname}/config/features.json`]
});

console.log('=====================');
console.log('config.getProperties()', config.getProperties());
console.log('=====================');
console.log('config.get(Base.env)', config.get('Base.env'));
console.log('=====================');
console.log('config.get(Feature.sample)', config.get('Feature.sample'));
console.log('=====================');
console.log('config.get(Client.example)', config.get('Client.example'));
console.log('=====================');
