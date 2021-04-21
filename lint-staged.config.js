module.exports = {
  '*.{js,jsx}': [() => 'yarn lint:aggressive'],
  '*.{ts,tsx}': [() => 'yarn lint:aggressive', () => 'yarn validate'],
  '{*.json,.{babelrc,eslintrc,prettierrc}}': [
    'prettier --config .prettierrc.js --ignore-path .eslintignore --parser json --write',
  ],
  '*.{css,scss,less}': ['prettier --config .prettierrc.js --ignore-path .eslintignore --write'],
  '*.{html,md,yml}': ['prettier --config .prettierrc.js --ignore-path .eslintignore --write'],
};
