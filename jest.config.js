module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testMatch: [
    '<rootDir>/test/**/*.test.js',
    '<rootDir>/**/*.test.js'
  ],
  collectCoverageFrom: [
    'app.js',
    'public/js/**/*.js',
    '!node_modules/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  transformIgnorePatterns: [
    'node_modules/(?!(fast-check|@exodus/bytes)/)'
  ]
};