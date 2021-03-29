module.exports = {
  '*.{js,jsx}': [() => 'yarn lint:aggressive'],
  '*.{ts,tsx}': [() => 'yarn lint:aggressive', () => 'yarn validate'],
  '{*.json,.{babelrc,eslintrc,prettierrc}}': ['prettier --ignore-path .eslintignore --parser json --write'],
  '*.{css,scss,less}': ['prettier --ignore-path .eslintignore --single-quote --write'],
  '*.{html,md,yml}': ['prettier --ignore-path .eslintignore --single-quote --write'],
};
