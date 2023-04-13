import configLoader from '@service-kit/config-loader';

const config = configLoader();

console.log('==================');
console.log('config.getProperties()', config.getProperties());
console.log('==================');
