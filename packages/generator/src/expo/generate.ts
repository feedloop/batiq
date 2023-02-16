import path from "node:path";
import fs from "node:fs";
import { AppSchema, ComponentSchema } from "@batiq/core";
import * as ExpoPackageManager from "@expo/package-manager";
import spawnAsync from "@expo/spawn-async";
import { generateNavigation } from "./navigation";
import { generatePage } from "../codegen";
import Dot from "dot-object";
import { toVariableName } from "../utils/naming";
import { transformIR } from "../intermediate-representation";

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
            transformIR(page, false).then((ir) =>
              ir.imports.map((imp) => imp.source)
            )
          )
        )
      ).flat()
    )
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
      },
      null,
      2
    )
  );
  const pm = new ExpoPackageManager.NpmPackageManager({
    cwd: process.cwd(),
    silent: false,
  });
  if (process.env["NODE_ENV"] === "development") {
    // remove yarn injected env variables
    Object.keys(process.env)
      .filter((key) => key.startsWith("npm"))
      .forEach((key) => {
        delete process.env[key];
      });
  }
  await pm.addAsync("expo");
  await pm.addDevAsync(
    "@babel/core",
    "@batiq/cli",
    "@types/react",
    "@types/react-native",
    "dotenv",
    "typescript"
  );
  await pm.installAsync();
  const expoInstall = spawnAsync("npx", [
    "expo",
    "install",
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
    "--npm",
  ]);
  expoInstall.child.stdout?.on("data", (data) => {
    console.log(data?.toString?.());
  });
  expoInstall.child.stderr?.on("data", (data) => {
    console.error(data?.toString?.());
  });
  await expoInstall;
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
        await generatePage(page, true)
      );
    })
  );
  fs.writeFileSync("app/App.tsx", generateNavigation(schema, true));
  fs.writeFileSync(
    "App.tsx",
    `import * as dotenv from 'dotenv';
dotenv.config();
export { default } from "./app/App";`
  );
  console.log("app generated");
};
