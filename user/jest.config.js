module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
};