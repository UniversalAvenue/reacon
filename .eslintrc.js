module.exports = {
  extends: 'airbnb',
  installedESLint: true,
  parser: 'babel-eslint',
  plugins: [
    'react',
    'jsx-a11y',
    'import',
  ],
  env: {
    browser: true,
    jest: true,
    jasmine: true,
    node: true,
  },
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'react/jsx-filename-extension': 'off',
    'no-console': 'off',
  },
};
