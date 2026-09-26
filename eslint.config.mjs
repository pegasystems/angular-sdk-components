import { globalIgnores } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';
import sonarjs from 'eslint-plugin-sonarjs';
import importPlugin from 'eslint-plugin-import';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  globalIgnores([
    '**/node_modules',
    'packages/*/lib',
    '**/*.json',
    '**/*.md',
    '**/*.svg',
    '**/*.d.ts',
    '**/*.mjs',
    'dist/*',
    'lib/*',
    '**/ext-libs.js'
  ]),
  {
    languageOptions: {
      globals: {
        PCore: 'readonly',
        window: 'readonly',
        console: 'readonly',
        document: 'readonly',
        fetch: 'readonly'
      },

      ecmaVersion: 13,
      sourceType: 'module',

      parserOptions: { project: 'tsconfig.json' }
    },

    settings: {
      'import/resolver': {
        typescript: {},
        node: {
          extensions: ['.js', '.ts']
        }
      }
    },

    plugins: {
      '@angular-eslint': angular,
      '@angular-eslint/template': angularTemplate,
      sonarjs,
      import: importPlugin
    },
    rules: {
      // Disable rules from shared configs we're not ready for yet.
      'sonarjs/cognitive-complexity': ['error', 20],
      'sonarjs/no-duplicate-string': 'off',

      //
      // Initial release: turning these off; phase in to "warn" or "error" over time
      'import/extensions': ['off', 'never'],
      'import/named': 'off',
      'import/no-cycle': 'off',
      'import/no-duplicates': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-self-import': 'off',
      'import/no-unresolved': 'off',
      'import/no-useless-path-segments': 'off',
      'import/order': 'off',

      'no-underscore-dangle': 'off', // TODO : adhere to standard naming
      'no-restricted-syntax': 'warn', // TODO : fix for-in loops

      '@typescript-eslint/naming-convention': 'off', // prefer warn but needs different parserOptions
      '@typescript-eslint/no-explicit-any': 'off', // prefer warn but needs different parserOptions
      '@typescript-eslint/no-empty-object-type': 'off', // prefer warn but needs different parserOptions
      '@typescript-eslint/ban-ts-comment': 'off', // prefer warn but needs different parserOptions
      '@typescript-eslint/no-unsafe-function-type': 'off',

      'import/no-relative-packages': 'off' // arnab
    }
  },
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, tseslint.configs.recommended, tseslint.configs.stylistic],
    processor: angularTemplate.processors['extract-inline-html'],
    rules: {
      ...angular.configs.recommended.rules,
      '@angular-eslint/prefer-inject': 'off',
      '@angular-eslint/prefer-standalone': 'off',
      '@angular-eslint/no-empty-lifecycle-method': 'off',
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', style: 'camelCase', prefix: ['app'] }],
      '@angular-eslint/component-selector': ['error', { type: 'element', style: 'kebab-case', prefix: ['app', 'component', 'lib', 'wss'] }],
      '@angular-eslint/no-output-on-prefix': 'off',
      '@typescript-eslint/consistent-generic-constructors': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
      '@typescript-eslint/method-signature-style': ['error', 'property'],
      'import/prefer-default-export': 'off',
      'import/no-relative-packages': 'off'
    }
  },
  {
    files: ['**/*.html'],
    languageOptions: { parser: angularTemplateParser },
    rules: {
      ...angularTemplate.configs.recommended.rules,
      ...angularTemplate.configs.accessibility.rules,
      '@angular-eslint/template/alt-text': 'off',
      '@angular-eslint/template/label-has-associated-control': 'off',
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
      '@angular-eslint/template/prefer-control-flow': 'off',
      '@angular-eslint/template/eqeqeq': 'off'
    }
  }
]);
