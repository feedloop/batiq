const { join } = require("path");
const nrwlConfig = require("@nx/react/plugins/bundle-rollup");

module.exports = (config) => {
  const nxConfig = nrwlConfig(config);

  if (nxConfig.output.format === "esm") {
    nxConfig.input = {
      index: nxConfig.input,
      module: join(__dirname, "./src/module.ts"),
    };
  }

  return nxConfig;
};
