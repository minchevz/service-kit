module.exports = {
  displayName: 'UNIT TEST',
  bail: true,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  collectCoverage: true,
  collectCoverageFrom: [],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  coveragePathIgnorePatterns: [ 'mock' ],
  maxWorkers: '50%',
  moduleFileExtensions: [ 'ts', 'js', 'json' ],
  modulePathIgnorePatterns: [ 'dist' ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: './test/.+\\.test\\.ts$',
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  coverageDirectory: '<rootDir>/coverage/',
  testResultsProcessor: 'jest-sonar-reporter'
};
