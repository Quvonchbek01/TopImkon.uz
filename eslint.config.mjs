import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier/flat';

/**
 * ESLint flat config. `eslint-config-next` 16 ships flat configs, so the
 * `FlatCompat` shim is not needed (and breaks on ESLint 10).
 */
const eslintConfig = [
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts'],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettierConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Node scripts are plain JavaScript and run outside the bundler.
    files: ['scripts/**/*.mjs'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
  {
    // Tests may print diagnostics while a case is being written.
    files: ['tests/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
];

export default eslintConfig;
