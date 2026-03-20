module.exports = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],

  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testMatch: ['**/auto-complete/**/*.spec.ts'],

  // Use transform with tsconfig path
  transform: {
    '^.+\\.(ts|js|mjs|html|svg)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/packages/angular-sdk-components/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$'
      }
    ]
  },

  // Transform Angular and other ES modules
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|@angular|@ngrx|rxjs|@pega)'
  ],

  // Module name mapper for mocks
  moduleNameMapper: {
    '^../field\\.base$': '<rootDir>/packages/angular-sdk-components/src/lib/_components/field/__mocks__/field.base.ts',
    '^../../../_bridge/component-mapper/component-mapper\\.component$': '<rootDir>/packages/angular-sdk-components/src/lib/_bridge/component-mapper/__mocks__/component-mapper.component.ts',
    '^../../../_services/datapage\\.service$': '<rootDir>/packages/angular-sdk-components/src/lib/_services/__mocks__/datapage.service.ts',
    '^../../../_helpers/event-util$': '<rootDir>/packages/angular-sdk-components/src/lib/_helpers/__mocks__/event-util.ts',
    '^../../../_types/PConnProps\\.interface$': '<rootDir>/packages/angular-sdk-components/src/lib/_types/__mocks__/PConnProps.interface.ts'
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs', 'json', 'node'],
  roots: ['<rootDir>/packages/angular-sdk-components/src']
};
