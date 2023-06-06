import path from "path";
import fs from "node:fs";
import { AppSchema } from "@batiq/core";
import { generatePage } from "../codegen";
import Dot from "dot-object";
import { toVariableName } from "../utils/naming";
import { transformIR } from "@batiq/ir";
import { generateNavigation } from "./navigation";
import { getCombinedKnownVersionsAsync } from "@expo/cli/build/src/start/doctor/dependencies/getVersionedPackages";

const dot = new Dot("__");

export const toSlug = (source: string): string =>
  source
    .toLocaleLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 0)
    .join("-");

export const installExpo = async (schema: AppSchema) => {
  console.log("installing expo on", process.cwd());
  const componentDependencies = Array.from(
    new Set(
      (
        await Promise.all(
          schema.pages.map((page) =>
            transformIR(schema, page, "native", false).then((ir) =>
              ir.imports.map((imp) => imp.source)
            )
          )
        )
      ).flat()
    )
  );
  const dependencies = [
    "expo",
    "@babel/core",
    "@batiq/cli",
    "@types/react",
    "@types/react-native",
    "dotenv",
    "typescript",
    "react",
    "react-dom",
    "react-native",
    "react-native-web",
    "@react-navigation/native-stack",
    "@react-navigation/bottom-tabs",
    "@react-navigation/native",
    "react-native-screens",
    "react-native-safe-area-context",
    "@expo/webpack-config",
    ...componentDependencies,
  ];
  const packages = await getCombinedKnownVersionsAsync({
    projectRoot: "./app",
    sdkVersion: "48.0.0",
    skipCache: false,
  });
  const resolvedDependencies = dependencies.reduce(
    (acc, dep) => ({ ...acc, [dep]: packages[dep] ?? "*" }),
    {} as Record<string, string>
  );
  fs.writeFileSync(
    "package.json",
    JSON.stringify(
      {
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
        dependencies: resolvedDependencies,
      },
      null,
      2
    )
  );
};

export const generateExpo = async (schema: AppSchema) => {
  console.log("generating app on", process.cwd());
  fs.mkdirSync("app/pages", { recursive: true });
  fs.writeFileSync(
    "app.json",
    JSON.stringify({
      expo: {
        name: schema.info.name,
        slug: toSlug(schema.info.name),
      },
    })
  );
  fs.writeFileSync(
    "babel.config.json",
    JSON.stringify(
      {
        presets: ["babel-preset-expo"],
      },
      null,
      2
    )
  );
  fs.writeFileSync(
    ".env",
    Object.entries(dot.object(schema.config))
      .map(([key, value]) => `${key.toUpperCase()}=${value}`)
      .join("\n")
  );
  await Promise.all(
    schema.pages.map(async (page) => {
      fs.writeFileSync(
        path.join("app/pages", `${toVariableName(page.name)}.tsx`),
        await generatePage(schema, page, true)
      );
    })
  );
  fs.writeFileSync("app/App.tsx", await generateNavigation(schema));
  fs.writeFileSync(
    "App.tsx",
    `import * as dotenv from 'dotenv';
dotenv.config();
export { default } from "./app/App";`
  );
  console.log("app generated");
};
