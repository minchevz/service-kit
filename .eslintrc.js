module.exports = {
  extends: [
    '@unicorn/eslint-config/base',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: [ '@typescript-eslint' ],
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
    ]
  }
};
