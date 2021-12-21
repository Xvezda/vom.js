module.exports = {
  'env': {
    'browser': true,
    'node': true,
    'es2021': true,
    'jest': true
  },
  'extends': ['eslint:recommended', 'plugin:compat/recommended'],
  'parserOptions': {
    'ecmaVersion': 13,
    'sourceType': 'module'
  },
  'ignorePatterns': ['**/dist/*.js'],
  'rules': {
    'semi': 'error',
    'quotes': ['error', 'single', {'avoidEscape': true}],
    'indent': [
      'error', 2, {
        'MemberExpression': 'off',
        'SwitchCase': 1,
        'CallExpression': {'arguments': 1},
        'VariableDeclarator': 'first',
        'ignoredNodes': [
          'TaggedTemplateExpression[tag.name="html"] *',
          'MemberExpression CallExpression[arguments]'
        ],
      }
    ],
    'max-len': [
      'error', {
        'code': 80,
        'ignoreComments': true,
        'ignoreTrailingComments': true,
        'ignoreUrls': true,
        'ignoreStrings': true,
        'ignoreTemplateLiterals': true,
        'ignoreRegExpLiterals': true,
      }
    ]
  },
  'overrides': [
    {
      'files': ['scripts/**/*.js', '*.spec.js'],
      'rules': {
        'compat/compat': 'off',
      },
    },
  ]
};
