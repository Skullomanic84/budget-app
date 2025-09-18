// eslint.config.mjs
// Monorepo: server (Node/TS) + client (React/Vite/TS)

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier'
import globals from 'globals'
import { fileURLToPath } from 'url'
import path from 'path'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default [
  // 0) Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/build/**',
    ],
  },

  // 1) Base JS rules
  js.configs.recommended,

  // 2) TypeScript base (flat) rules
  ...tseslint.configs.recommended,

  // 3) SERVER (Node)
  {
    files: ['server/**/*.{ts,js}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        // IMPORTANT: project is relative to tsconfigRootDir
        tsconfigRootDir: path.join(rootDir, 'server'),
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: { ...globals.node },
    },
    rules: {
      // Express error middleware needs 4 args; allow _prefixed unused
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // 3b) SERVER TESTS (Vitest globals + type-aware)
  {
    files: ['server/tests/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        tsconfigRootDir: path.join(rootDir, 'server'),
        project: './tsconfig.json',
      },
      globals: {
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },

  // 4) CLIENT APP (React/Vite) - App source files
  {
    files: ['client/src/**/*.{ts,tsx,js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        tsconfigRootDir: rootDir,
        project: 'client/tsconfig.app.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: { ...globals.browser },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Explicitly disable react-refresh rule for all client files
      'react-refresh/only-export-components': 'off',
    },
  },

  // 4b) CLIENT CONFIG (Node.js files like vite.config.ts)
  {
    files: ['client/*.{ts,js,mts,mjs}', 'client/*.config.{ts,js,mts,mjs}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        tsconfigRootDir: rootDir,
        project: 'client/tsconfig.node.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: { ...globals.node },
    },
    rules: {
      // Node.js config files don't need React rules
    },
  },

  // 5) MISC TESTS (any tests outside server/tests)
  {
    files: ['**/*.test.{ts,tsx,js,jsx}', '**/tests/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: { 'no-console': 'off' },
  },

  // 6) Prettier last to disable conflicting stylistic rules
  prettier,
]
