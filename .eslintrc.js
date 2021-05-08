module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-console': 0,
    'linebreak-style': 0,
    'import/newline-after-import': 0,
    'comma-dangle': 0,
    'no-underscore-dangle': 0,
    'consistent-return': 0,
    'object-curly-newline': 0,
    // 'arrow-body-style': [2, 'as-needed'],
    // 'implicit-arrow-linebreak': 0,
    // 'import/newline-after-import': 0,
  },
};
