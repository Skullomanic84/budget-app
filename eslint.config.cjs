// eslint.config.cjs — ESLint v9 flat config (root)

const js = require('@eslint/js')
const tseslint = require('typescript-eslint')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const tsParser = require('@typescript-eslint/parser')

module.exports = [
  // 1) Ignore build artifacts
  {
    ignores: ['**/dist/**', '**/.next/**', '**/node_modules/**'],
  },

  // 2) Base JS rules
  js.configs.recommended,

  // 3) TypeScript recommended (flat) — provides sensible TS rules
  ...tseslint.configs.recommended,

  // 4) Project rules for TS/React files
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // If you later want type-aware rules, set:
        // projectService: true,  // requires TS 5.4+ and tsconfig.json present
        // tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // React 17+ / Next.js don’t require React in scope
      'react/react-in-jsx-scope': 'off',
      // Optional: strengthen hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]
