const withTypescript = require("@zeit/next-typescript");

module.exports = withTypescript({
  pageExtensions: ["tsx", "ts"],
  distDir: "../build"
});
