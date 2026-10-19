import { createRequire } from 'node:module'

import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const require = createRequire(import.meta.url)
const indentEmptyLinesPlugin = require('eslint-plugin-indent-empty-lines').default

const basePlugins = {
    'indent-empty-lines': indentEmptyLinesPlugin,
    'simple-import-sort': simpleImportSort,
}

const stylisticRules = {
    '@stylistic/indent': ['error', 4, { SwitchCase: 1 }],
    '@stylistic/linebreak-style': ['error', 'unix'],
    '@stylistic/quotes': ['error', 'single'],
    '@stylistic/semi': ['error', 'never'],
    '@stylistic/arrow-parens': ['error', 'as-needed'],
    '@stylistic/comma-dangle': ['error', 'always-multiline'],
    '@stylistic/max-len': ['error', { code: 120 }],
    '@stylistic/block-spacing': ['error', 'always'],
    '@stylistic/space-before-blocks': ['error', 'always'],
    '@stylistic/keyword-spacing': ['error', { before: true, after: true }],
    '@stylistic/object-curly-spacing': ['error', 'always'],
}

export default tseslint.config(
    {
        ignores: [
            'dist',
            'apps/web/src/components/ui/**',
            'apps/web/src/components/charts/**',
            'apps/mobile/**',
            'apps/gnome-ext/src/**',
            'apps/gnome-ext/dist/**',
            '**/node_modules/**',
            'coverage',
        ],
    },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['eslint.config.js', '**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            '@stylistic': stylistic,
            ...basePlugins,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            'linebreak-style': ['error', 'unix'],
            'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
            'no-eq-null': 'error',
            radix: ['error', 'always'],
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
            'indent-empty-lines/indent-empty-lines': ['error', 4],
            'preserve-caught-error': 'off',
            'no-unused-vars': 'off',
            'no-console': 'error',
            ...stylisticRules,
        },
    },
    {
        files: ['scripts/**/*.{ts,tsx}'],
        rules: {
            'no-console': 'off',
        },
    },
)
