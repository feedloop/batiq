import yargs from "yargs";
import { hideBin } from "yargs/helpers";
// import { generateNavigation, generatePage } from "@batiq/generator";
// eslint-disable-next-line
import { generateNavigation, generatePage } from "../../generator/src/index.js";
// import {
//   generateNavigation,
//   generatePage,
// } from "../../../node_modules/@batiq/generator/src/index.js";
import { AppSchema, BaseBatiqCore, ComponentSchema } from "@batiq/core";
import * as ExpoPackageManager from "@expo/package-manager";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import spawnAsync from "@expo/spawn-async";

const require = createRequire(import.meta.url);
// const { generateNavigation, generatePage } = require("@batiq/generator");

export const toVariableName = (source: string): string =>
  source
    .split(/\W+/)
    .filter((word) => word.length > 0)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join("_");

export const toSlug = (source: string): string =>
  source
    .toLocaleLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 0)
    .join("-");

export const main = (argv: string[]) => {
  yargs(hideBin(argv))
    .command(
      "generate <schema>",
      "generate project from schema",
      {
        output: {
          alias: "o",
          type: "string",
          description: "path to output directory",
          default: "app",
        },
        schema: {
          type: "string",
          demandOption: true,
        },
      },
      async (argv) => {
        const schema: AppSchema = JSON.parse(
          fs.readFileSync(argv.schema, "utf8")
        );
        fs.mkdirSync(argv.output, { recursive: true });
        fs.mkdirSync(path.join(argv.output, "app/pages"), { recursive: true });
        const getComponentDependencies = (
          component: ComponentSchema
        ): string[] =>
          component.children.flatMap((component) => [
            component.from,
            ...getComponentDependencies(component),
          ]);
        const componentDependencies = Array.from(
          schema.pages.flatMap((page) =>
            page.children.flatMap(getComponentDependencies)
          )
        );
        await Promise.all(
          schema.pages.map(async (page) => {
            fs.writeFileSync(
              path.join(
                argv.output,
                "app/pages",
                `${toVariableName(page.name)}.tsx`
              ),
              await generatePage(page, true)
            );
          })
        );
        fs.writeFileSync(
          path.join(argv.output, "App.tsx"),
          'export { default } from "./app/App";'
        );
        fs.writeFileSync(
          path.join(argv.output, "app/App.tsx"),
          generateNavigation(schema, true)
        );
        fs.writeFileSync(
          path.join(argv.output, "app.json"),
          JSON.stringify({
            expo: {
              name: schema.info.name,
              slug: toSlug(schema.info.name),
            },
          })
        );
        fs.writeFileSync(
          path.join(argv.output, "babel.config.json"),
          JSON.stringify(
            {
              presets: ["babel-preset-expo"],
            },
            null,
            2
          )
        );
        fs.writeFileSync(
          path.join(argv.output, "package.json"),
          JSON.stringify({
            name: schema.info.name,
            version: "1.0.0",
            main: "node_modules/expo/AppEntry.js",
            scripts: {
              start: "expo start",
              android: "expo start --android",
              ios: "expo start --ios",
              web: "expo start --web",
            },
            private: true,
          })
        );
        const pm = new ExpoPackageManager.YarnPackageManager({
          cwd: path.resolve(argv.output),
          silent: false,
        });
        await pm.addAsync(
          "expo",
          "react@18.1.0",
          "react-dom@18.1.0",
          "react-native@0.70.5",
          "react-native-web"
        );
        await pm.addDevAsync(
          "@babel/core",
          "@expo/webpack-config",
          "@types/react",
          "@types/react-native",
          "typescript"
        );
        await pm.installAsync();
        const expoInstall = spawnAsync(
          "./node_modules/.bin/expo",
          [
            "install",
            "@react-navigation/native-stack",
            "@react-navigation/bottom-tabs",
            "@react-navigation/native",
            "react-native-screens",
            "react-native-safe-area-context",
            ...componentDependencies,
          ],
          {
            cwd: path.resolve(argv.output),
          }
        );
        expoInstall.child.stdout?.on("data", (data) => {
          console.log(data?.toString?.());
        });
        expoInstall.child.stderr?.on("data", (data) => {
          console.error(data?.toString?.());
        });
        await expoInstall;
        console.log("app generated");
      }
    )
    .demandCommand(1)
    .help()
    .parse();
};

main(process.argv);
