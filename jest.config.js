module.exports = {
  roots: ["<rootDir>"],
  moduleNameMapper: {
    "^shared/(.+)": "<rootDir>/src/shared/$1"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  collectCoverageFrom: ["**/src/**/*.{js,jsx,ts,tsx}"],
  setupFilesAfterEnv: ["./rtl.setup.ts"]
};
