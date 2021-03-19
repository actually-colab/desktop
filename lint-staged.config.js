module.exports = {
  '*.{js,jsx,ts,tsx}': ['yarn lint'],
  '{*.json,.{babelrc,eslintrc,prettierrc}}': ['prettier --ignore-path .eslintignore --parser json --write'],
  '*.{css,scss,less}': ['prettier --ignore-path .eslintignore --single-quote --write'],
  '*.{html,md,yml}': ['prettier --ignore-path .eslintignore --single-quote --write'],
};
