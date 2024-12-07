module.exports = {
    preset: 'ts-jest',
    transform: {
      '^.+\\.(ts|tsx)?$': 'ts-jest',
      '^.+\\.(js|jsx)$': 'babel-jest',
    },
    "collectCoverage": true,
    "maxWorkers": 4,
    "bail": true,
    "coverageReporters": [
      "html",
      "lcov",
      "text",
      "cobertura"
    ],
    "coverageThreshold": {
      "global": {
        "lines": 85
      }
    },
    "reporters": [
      "default",
      "jest-junit"
    ],
    "runTestsByPath": true,
    "openHandlesTimeout": 0
  };