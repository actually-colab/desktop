module.exports = {
  parserOptions: {
    ecmaVersion: 6,
    warnOnUnsupportedTypeScriptVersion: false,
  },
  plugins: ['react-hooks'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'import/order': 'error',
    'react/jsx-fragments': 'off',
    'react/jsx-boolean-value': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-unused-expressions': 'warn',
    'handle-callback-err': 'off',
    'prefer-promise-reject-errors': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  extends: ['react-app', 'plugin:prettier/recommended'],
};