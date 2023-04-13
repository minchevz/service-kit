/* eslint-disable @typescript-eslint/no-var-requires */
import { promises } from 'fs';
import { join } from 'path';
import deepmerge from 'deepmerge';
import { IErrorDictionary, IErrorMap, IError } from '../../types';

const getFileData = (path: string) => {
  const file = require(path);

  return file.default || file;
};

export const loadErrorDictionaries = async (directories: string[]): Promise<IErrorMap> => {
  const directoryResults = await Promise.all(directories.map(path => promises.readdir(path)));

  return directoryResults.reduce((map: IErrorMap, fileArray, index) => {
    const dataArray = fileArray
      .filter(file => !file.includes('.d.ts'))
      .map(file => getFileData(join(directories[index], file)));

    dataArray.forEach((dictionary: IErrorDictionary) => {
      map[dictionary.language_code] = deepmerge(map[dictionary.language_code], dictionary.errors);
    });

    return map;
  }, {});
};

const DEFAULT_LANG = 'en';

export const findDictionaryLocale = (
  errorsMap: IErrorMap,
  languageHeader?: string
): Record<string, IError> => {
  const languageCode = languageHeader ? languageHeader.slice(0, 2) : DEFAULT_LANG;

  return errorsMap[languageCode] || errorsMap[DEFAULT_LANG];
};
