const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/livenessWebSdk",
  output: {
    path: path.resolve(__dirname, "lib"),
    filename: "livenessWebSdk.min.js",
    library: "livenessWebSdk",
    libraryTarget: "umd",
  },
};
