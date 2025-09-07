// ESLint v9 Flat Config for monorepo (server + client)
// - TypeScript + React (client)
// - Node (server)
// - Vitest test files
// - Prettier compatibility

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

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

  // 2) TypeScript recommended rules
  ...tseslint.configs.recommended,

  // 3) Server (Node) files
  {
    files: ['server/**/*.{ts,js}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // When you want type-aware rules later, enable:
        // projectService: true,
        // tsconfigRootDir: new URL('./server', import.meta.url),
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Node-specific rule tweaks go here if you want
    },
  },

  // 4) Client (React) files
  {
    files: ['client/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        // Type-aware later?:
        // projectService: true,
        // tsconfigRootDir: new URL('./client', import.meta.url),
      },
      globals: {
        ...globals.browser,
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
      // React 17+ / Vite don’t require React in scope
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // 5) Test files (Vitest)
  {
    files: ['**/*.test.{ts,tsx,js,jsx}', '**/tests/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Vitest globals
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
    rules: {
      // Tests often allow dev deps and console logs – tweak if needed
      'no-console': 'off',
    },
  },

  // 6) Prettier: turn off formatting-related ESLint rules
  prettier,
]
