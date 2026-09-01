import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'next-env.d.ts', '*.config.*'] },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,

  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // User-facing copy lives in src/i18n/es.ts and nowhere else, so it stays
  // reviewable in one file. Components import `es`, never inline Spanish.
  //
  // Enforced by review rather than by a rule: no lint rule can tell a Spanish
  // label from an English identifier reliably. Documented here so the
  // convention is discoverable where it is broken.
  // -------------------------------------------------------------------------

  // The generated OpenAPI types are not ours to lint.
  { files: ['src/lib/api/schema.d.ts'], rules: { '@typescript-eslint/no-explicit-any': 'off' } },

  {
    files: ['**/*.test.ts', '**/*.test.tsx', 'test/**/*.ts', 'e2e/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
);
