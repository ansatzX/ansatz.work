export default {
  transform: {
    '^.+\.js$': 'babel-jest',
  },
  testMatch: [
    '**/src/**/__tests__/**/*.js',
  ],
  clearMocks: true,
  transformIgnorePatterns: [
    '/node_modules/(?!(?:@sindresorhus/slugify|escape-string-regexp|@sindresorhus/transliterate)/)',
  ],

};
