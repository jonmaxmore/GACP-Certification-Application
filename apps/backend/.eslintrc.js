module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-undef': 'error',
    'no-console': 'off',
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
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
  ],
  ignorePatterns: ['node_modules/', 'dist/', 'coverage/', '.turbo/'],
};
