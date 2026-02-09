import { createRequire } from 'node:module'
import eslintJs from '@eslint/js'
import oxlint from 'eslint-plugin-oxlint'
import reactPlugin from 'eslint-plugin-react'
import reactCompiler from 'eslint-plugin-react-compiler'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import globals from 'globals'

const require = createRequire(import.meta.url)
const indentEmptyLinesPlugin = require('eslint-plugin-indent-empty-lines').default

// @todo investigate these
// https://github.com/dustinspecker/awesome-eslint
// https://github.com/github/eslint-plugin-github
// https://github.com/sindresorhus/eslint-plugin-unicorn
// https://github.com/francoismassart/eslint-plugin-tailwindcss

// Turn this on while developing for extra hints, but
// disable before committing, since it generates tons of warnings
const strictMode = false

const sharedGlobals = {
    ...globals.browser,
    ...globals.jest,
    process: 'readonly',
    Logger: 'readonly',
}

const reactSettings = {
    react: {
        version: 'detect',
    },
}

const basePlugins = {
    react: reactPlugin,
    'react-compiler': reactCompiler,
    'react-hooks': reactHooksPlugin,
    'indent-empty-lines': indentEmptyLinesPlugin,
    'simple-import-sort': simpleImportSort,
}

const baseRules = {
    ...eslintJs.configs.recommended.rules,
    'react-compiler/react-compiler': 'error',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': strictMode ? 'error' : 'off',
    'react/jsx-no-literals': 'off',
    'react/jsx-closing-bracket-location': ['error', 'after-props'],
    'no-restricted-globals': ['error', 'document'],
    'no-restricted-syntax': [
        'error',
        {
            selector:
                'JSXAttribute[ name.name="className" ] > JSXExpressionContainer' +
                '> TemplateLiteral > TemplateElement[source.raw*="z-"]',
            message: 'Avoid using Tailwind z-index classes in JSX.',
        },
        {
            selector:
                'JSXAttribute[ name.name="style" ] > JSXExpressionContainer' +
                '> ObjectExpression > Property[key.name="zIndex"] > Literal',
            message: 'Avoid using Tailwind z-index values directly in style props.',
        },
        {
            selector: 'CallExpression[callee.name="setSearchParams"] > ObjectExpression',
            message: 'Use the callback syntax for setSearchParams.',
        },
    ],
    indent: [
        'error',
        4,
        {
            SwitchCase: 1,
        },
    ],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'arrow-parens': ['error', 'as-needed'],
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'comma-dangle': ['error', 'always-multiline'],
    'max-len': ['error', { code: 120 }],
    'block-spacing': ['error', 'always'],
    'space-before-blocks': ['error', 'always'],
    'indent-empty-lines/indent-empty-lines': ['error', 4],
    'keyword-spacing': ['error', { before: true, after: true }],
    radix: ['error', 'always'],
    'no-eq-null': 'error',
    'object-curly-spacing': ['error', 'always'],
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
}

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    // global ignores
    {
        ignores: [
            'dist/**',
            'build/**',
            '.next/**',
            'node_modules/**',
            'apps/api/node_modules/**',
            'apps/web/node_modules/**',
            'components/ui/**',
            'src/components/ui/**',
            'apps/web/src/components/ui/**',
            'task/**',
        ],
    },
    {
        files: ['**/*.{js,jsx,mjs,cjs}'],
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
        languageOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: sharedGlobals,
        },
        plugins: {
            ...basePlugins,
            
        },
        settings: reactSettings,
        rules: {
            ...baseRules,
            'react/jsx-filename-extension': ['error', { extensions: ['.jsx'] }],
            
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
        languageOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: sharedGlobals,
        },
        plugins: {
            ...basePlugins,
            '@typescript-eslint': tsPlugin,
        },
        settings: reactSettings,
        rules: {
            ...baseRules,
            ...tsPlugin.configs.recommended.rules,
            'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],
            'no-undef': 'off',
        },
    },

    // ...oxlint.configs['flat/recommended'], // oxlint should be the last one
    ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'), // oxlint should be the last one
]
