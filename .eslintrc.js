module.exports = {
  extends: 'airbnb',
  rules: {
    'comma-dangle': 0
  },
  plugins: ['import'],
  settings: {
    'import/resolver': 'webpack'
  }
};
