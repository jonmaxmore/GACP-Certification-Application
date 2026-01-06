/**
 * ESLint Configuration - Military Grade
 * Enforces strict code quality for production
 */
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // === CRITICAL: Production Safety ===
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-debugger': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',

    // === CRITICAL: Error Prevention ===
    'no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],
    'no-undef': 'error',
    'no-unreachable': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'valid-typeof': 'error',

    // === Security ===
    'no-var': 'error',
    'prefer-const': 'error',
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'curly': ['error', 'all'],

    // === Best Practices ===
    'no-case-declarations': 'error',
    'no-fallthrough': 'error',
    'no-redeclare': 'error',
    'no-self-assign': 'error',
    'no-self-compare': 'error',

    // === Style ===
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'object-curly-spacing': ['error', 'always'],
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      parserOptions: {
        sourceType: 'module',
      },
      rules: {
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'error', // Changed from warn to error
      },
    },
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
  ignorePatterns: ['node_modules/', 'dist/', 'coverage/', '.turbo/', '*.min.js'],
};
