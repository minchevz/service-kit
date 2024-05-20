module.exports = {
  displayName: 'UNIT TEST',
  bail: true,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  collectCoverage: true,
  collectCoverageFrom: [ './src/**' ],
  coveragePathIgnorePatterns: [ 'mock', 'src/lib/development', './src/config/schema/*' ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
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
