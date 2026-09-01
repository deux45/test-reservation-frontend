/**
 * Conventional Commits, enforced.
 *
 * `commit-and-tag-version` derives the semantic version from these messages,
 * so a mistyped commit produces a wrong version number and a changelog that
 * misleads whoever upgrades.
 *
 * feat:     -> MINOR   fix: -> PATCH   BREAKING CHANGE footer -> MAJOR
 */

/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'reservations',
        'resources',
        'availability',
        'schedule',
        'auth',
        'theme',
        'i18n',
        'api',
        'common',
        'docker',
        'ci',
        'docs',
        'deps',
        // commit-and-tag-version writes `chore(release): vX.Y.Z` itself, so
        // this scope has to be allowed or every release commit is rejected.
        'release',
      ],
    ],
    'scope-empty': [1, 'never'],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'body-max-line-length': [1, 'always', 100],
    'header-max-length': [2, 'always', 100],
  },
};
