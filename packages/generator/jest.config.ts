/* eslint-disable */
import { readFileSync } from "fs";

// Reading the SWC compilation config and remove the "exclude"
// for the test files to be compiled by SWC
const { exclude: _, ...swcJestConfig } = JSON.parse(
  readFileSync(`${__dirname}/.lib.swcrc`, "utf-8")
);
export default {
  displayName: "generator",
  preset: "../../jest.preset.js",
  transform: {
    "^.+\\.[tj]sx?$": ["@swc/jest", { ...swcJestConfig }],
  },
  moduleFileExtensions: ["ts", "js", "html", "tsx"],
  coverageDirectory: "../../coverage/packages/generator",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
};
