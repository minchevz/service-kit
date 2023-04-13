/* eslint-disable @typescript-eslint/no-explicit-any */
import { IServiceKitModule } from '@service-kit/common';
import { ServerOptions, ServerExport } from '@service-kit/server/types';

export interface IServiceKitManifest {
  id: string;
  name: string;
  modules?: IServiceKitModule[];
  configPaths?: string[];
  api: ServerOptions;
}

export interface IServiceKit {
  server: ServerExport;
}

export interface IDependencyMap {
  [propName: string]: any;
}
