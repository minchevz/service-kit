export const getStaticFileDirectory = (path: string) => path.split('/').slice(0, -1).join('/');
export const getValidContractFileName = (path: string) =>
  /.yml|.yaml/g.test(path) && path.split('/').pop();
export const getValidVersion = (path: string) => {
  const versionPath = path.match(/\/v(\d+)/g);

  return versionPath && versionPath[0].replace(/\//g, '');
};

export const getValidContractPaths = (contractPaths: string[]): string[] => contractPaths.map((contractPath) => {
  const directory = getStaticFileDirectory(contractPath);
  const contractName = getValidContractFileName(contractPath);
  const version = getValidVersion(contractPath);

  if (!contractName) {
    throw new Error('Invalid contract file extention! Please use .yml/yaml format.');
  }
  if (!version) {
    throw new Error('Invalid version definition ! Please use v1/v2/vX format.');
  }

  return (`${ directory }/${ contractName }`);
}).filter(path => path);
