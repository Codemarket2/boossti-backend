const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  // testEnvironment: 'node',
  // setupFilesAfterEnv: ['./jest/jestSetup.ts'],
  testTimeout: 40000,
  preset: '@shelf/jest-mongodb',
  transform: tsjPreset.transform,
};
