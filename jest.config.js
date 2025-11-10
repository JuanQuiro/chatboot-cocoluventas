module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.(spec|test)\\.(ts|js)$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    'src-ts/**/*.(t|j)s',
    '!src/**/*.spec.ts',
    '!src/**/*.test.js',
    '!src-ts/**/*.spec.ts',
    '!src-ts/**/*.interface.ts',
    '!src-ts/**/index.ts',
    '!src-ts/main.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/', '<rootDir>/src-ts/', '<rootDir>/test/', '<rootDir>/tests/'],
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src-ts/domain/$1',
    '^@application/(.*)$': '<rootDir>/src-ts/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src-ts/infrastructure/$1',
    '^@presentation/(.*)$': '<rootDir>/src-ts/presentation/$1',
    '^@shared/(.*)$': '<rootDir>/src-ts/shared/$1',
  },
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
