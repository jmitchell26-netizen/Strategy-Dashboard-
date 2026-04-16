// eslint.config.js — ESLint "flat config" (ESLint 9+) for this repo.
// Lints all .js and .jsx files with recommended rules, React Hooks rules, and
// Vite-friendly react-refresh rules. Run `npm run lint` from the project root.
// Docs: https://eslint.org/docs/latest/use/configure/configuration-files

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Never lint the production build output
  globalIgnores(['dist']),

  {
    // Apply these settings to all JavaScript and JSX source files
    files: ['**/*.{js,jsx}'],

    // Extend recommended presets: core JS, React Hooks (rules of hooks), React Refresh (HMR safety)
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser, // window, document, fetch, etc.
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },

    rules: {
      // Allow unused variables that look like React components (PascalCase) or ALL_CAPS constants
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },

  // shadcn/ui components export both components and helpers — relax react-refresh rule for them
  // Must come AFTER the main config block so it overrides it for these files
  {
    files: ['src/components/ui/**/*.{js,jsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
