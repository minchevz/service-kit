import { IConfig, ILogger, IServiceKitModule } from '@service-kit/common';
import { IDependencyMap } from '../../types';

export const bootstrap = async (
  config: IConfig,
  logger: ILogger,
  dependenciesMap: IDependencyMap,
  module: IServiceKitModule
): Promise<unknown> => {
  const populatedDependencies = module.dependencies.map(
    dependency => dependenciesMap[dependency]
  );

  return await module.bootstrap(config, logger, populatedDependencies);
};

export const accessHandler = (target: IDependencyMap, prop: string): unknown => {
  if (!target._bootstrapped) {
    throw new Error('Unable to access modules before bootstrapping');
  }

  return target[prop];
};
