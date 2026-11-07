import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['**/node_modules/**'],
  },
  {
    files: ['src/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'off',
      'no-alert': 'off',
    },
  },
  {
    files: ['src/sw.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.serviceworker,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'off',
      'no-alert': 'off',
    },
  },
  eslintConfigPrettier,
];
