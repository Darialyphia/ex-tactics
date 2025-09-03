module.exports = {
  root: true,
  extends: ['daria/vue'],
  rules: {
    '@typescript-eslint/no-floating-promises': 'error'
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  }
};
