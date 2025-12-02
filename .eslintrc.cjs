/**
 * Monorepo ESLint configuration (CommonJS to support `type: module` root)
 * - Supports Node.js backend + Next.js frontends + shared packages
 * - Keeps rules lightweight so linting works without full type-checking
 * - Plays nicely with Prettier via `plugin:prettier/recommended`
 */
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '.next/',
    'out/',
    '*.config.js.DISABLED',
    '**/generated/',
    '**/*.d.ts',
    'pnpm-lock.yaml',
  ],
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-undef': 'off',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
    {
      files: ['apps/**/*.{ts,tsx,js,jsx}'],
      extends: ['next', 'next/core-web-vitals'],
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: {
        'react/react-in-jsx-scope': 'off',
      },
    },
    {
      files: ['**/__tests__/**/*.{js,ts,tsx}', '**/*.{spec,test}.{js,ts,tsx}'],
      env: {
        jest: true,
        node: true,
      },
      plugins: ['jest'],
      extends: ['plugin:jest/recommended', 'plugin:jest/style'],
      rules: {
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
      },
    },
    {
      files: ['apps/backend/**/*.{js,ts}'],
      env: {
        node: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
