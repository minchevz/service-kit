module.exports = {
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:you-dont-need-lodash-underscore/compatible'
  ],
  parser: '@typescript-eslint/parser',
  plugins: [ '@typescript-eslint', 'import', 'promise' ],
  settings: {
    'import/resolver': {
      node: {
        extensions: [ '.js', '.json', '.ts' ]
      }
    }
  },
  ignorePatterns: [ 'dist', 'mocks' ],
  rules: {
    indent: [ 'error', 2 ],
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'semi',
          requireLast: true
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false
        }
      }
    ],
    'max-len': [ 'error', { code: 135, tabWidth: 2 } ],
    'no-multiple-empty-lines': [ 'error', { max: 1 } ],
    'consistent-return': 2,
    'guard-for-in': 2,
    'no-else-return': 2,
    'no-multi-spaces': 2,
    'no-extra-semi': 2,
    'import/no-duplicates': 'warn',
    'import/unambiguous': 'off',
    'promise/always-return': 'warn',
    'promise/no-return-wrap': 'warn',
    'promise/catch-or-return': 'warn',
    'template-curly-spacing': [ 'error', 'always' ],
    'array-bracket-spacing': [ 'error', 'always' ],
    'no-class-assign': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-constructor': 'error',
    'arrow-body-style': [ 'error', 'as-needed' ],
    'prefer-arrow-callback': 'error',
    'arrow-parens': [
      'error',
      'as-needed',
      {
        requireForBlockBody: true
      }
    ],
    'no-confusing-arrow': [
      'error',
      {
        allowParens: true
      }
    ],
    'prefer-destructuring': [
      'off',
      {
        array: true,
        object: true
      },
      {
        enforceForRenamedProperties: false
      }
    ],
    'object-shorthand': [
      'error',
      'always',
      {
        ignoreConstructors: false,
        avoidQuotes: true
      }
    ],
    'no-useless-rename': [
      'error',
      {
        ignoreDestructuring: false,
        ignoreImport: false,
        ignoreExport: false
      }
    ],
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'no-useless-concat': 'error'
  }
};
