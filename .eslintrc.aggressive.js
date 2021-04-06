module.exports = {
  parserOptions: {
    ecmaVersion: 6,
    warnOnUnsupportedTypeScriptVersion: false,
  },
  plugins: ['react-hooks'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react/jsx-fragments': 'off',
    'react/jsx-boolean-value': 'off',
    'import/order': 'error',
    'no-unused-expressions': 'error',
    'handle-callback-err': 'off',
    'prefer-promise-reject-errors': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  extends: ['react-app', 'plugin:prettier/recommended', 'plugin:@typescript-eslint/recommended'],
};
