module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: [
    'jest-extended',
  ],
  moduleNameMapper: {
    '^@externals/(.*)': '<rootDir>/src/externals/$1',
    '^@use-cases/(.*)': '<rootDir>/src/use-cases/$1',
    '^@controllers/(.*)': '<rootDir>/src/controllers/$1',
    '^@presenters/(.*)': '<rootDir>/src/presenters/$1',
    '^@test/utils/(.*)': '<rootDir>/test/utils/$1',
    '^@infrastructures/(.*)': '<rootDir>/src/infrastructures/$1',
    '^@modules/(.*)': '<rootDir>/src/modules/$1'
  },
  testMatch: [
    '<rootDir>/src/**/*.spec.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'html'
  ]
}
