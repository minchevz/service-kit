import {
  getStaticFileDirectory,
  getValidVersion,
  getValidContractFileName
} from '../../../src/utils/filePathValidation';

const filename = 'example.yml';
const version = 'v3';
const pathmock = `/folder/subfolder/${ version }/${ filename }`;

describe('Given filePathValidation utils module', () => {
  describe('when getStaticFileDirectory is triggered', () => {
    it('should return the directory', () => {
      expect(getStaticFileDirectory(pathmock)).toEqual('/folder/subfolder/v3');
    });
  });

  describe('when getValidContractFileName is triggered,', () => {
    it('should return the correct filename', () => {
      expect(getValidContractFileName(pathmock)).toEqual(filename);
    });

    describe('and if filename is NOT yml or yaml type', () => {
      it('should return null', () => {
        expect(getValidContractFileName('/folder/subfolder/v3/example.json')).toBeFalsy();
      });
    });
  });

  describe('when given a file that exports the controller as the default', () => {
    it('should return the controller function', () => {
      expect(getValidVersion(pathmock)).toEqual(version);
    });
  });
});
