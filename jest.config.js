module.exports = {
  collectCoverageFrom: [],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  coveragePathIgnorePatterns: [ 'mock' ],
  moduleFileExtensions: [ 'ts', 'js', 'json' ],
  modulePathIgnorePatterns: [ 'dist' ],
  preset: 'ts-jest',

  testEnvironment: 'node',
  testRegex: './test/.+\\.test\\.ts$',
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  }
};
