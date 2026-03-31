const { defaults: tsjPreset } = require('ts-jest/presets');
const path = require('path');

module.exports = {
  ...tsjPreset,
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: path.resolve(__dirname, '../tsconfig.e2e.json'),
      },
    ],
  },
  moduleNameMapper: {
    '^src/(.*)$': path.resolve(__dirname, '../src/$1'),
  },
  setupFilesAfterEnv: ['./setup.ts'],
  forceExit: true,
  detectOpenHandles: true,
};
