module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
  },
  extends: 'airbnb',
  rules: {
    'class-methods-use-this': 0,
    'no-param-reassign': 0,
  }
};
