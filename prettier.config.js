/**
 * Prettier Configuration
 * Standard formatting rules for entire monorepo
 */

export default {
  // Basic formatting
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,

  // Line endings (auto-detect to support Windows/Linux)
  endOfLine: 'auto',

  // Brackets
  bracketSpacing: true,
  arrowParens: 'always',

  // Markdown
  proseWrap: 'preserve',

  // Override for specific file types
  overrides: [
    {
      files: '*.md',
      options: {
        printWidth: 80,
      },
    },
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
  ],
};
