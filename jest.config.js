module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  globals: {
    'babel-jest': {
      useESM: true,
    },
  },
};
