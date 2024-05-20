export const allEndpoints = config => Object.keys(config).reduce((acc, key) => {
  Object.assign(acc.scenarios, config[key].scenarios);
  Object.assign(acc.thresholds, config[key].thresholds);

  return acc;
}, { scenarios: {}, thresholds: {} });
