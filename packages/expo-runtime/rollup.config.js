const { join } = require("path");
const nrwlConfig = require("@nx/react/plugins/bundle-rollup");

module.exports = (config) => {
  const nxConfig = nrwlConfig(config);

  if (nxConfig.output.format === "esm") {
    nxConfig.input = {
      index: nxConfig.input,
      actions: join(__dirname, "./src/actions.ts"),
    };
  }

  return nxConfig;
};
