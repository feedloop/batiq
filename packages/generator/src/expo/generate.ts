import path from "node:path";
import fs from "node:fs";
import { AppSchema, ComponentSchema } from "@batiq/core";
import * as ExpoPackageManager from "@expo/package-manager";
import spawnAsync from "@expo/spawn-async";
import { toVariableName } from "../transformIR";
import { generateNavigation } from "./navigation";
import { generatePage } from "../codegen";
import Dot from "dot-object";

const dot = new Dot("__");

export const toSlug = (source: string): string =>
  source
    .toLocaleLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 0)
    .join("-");

const generateExpo = async (schema: AppSchema, output: string) => {
  const cwd = process.cwd();
  fs.mkdirSync(output, { recursive: true });
  fs.mkdirSync(path.join(output, "app/pages"), { recursive: true });
  try {
    process.chdir(output);
    const getComponentDependencies = (component: ComponentSchema): string[] =>
      component.children.flatMap((component) => [
        component.from,
        ...getComponentDependencies(component),
      ]);
    const componentDependencies = Array.from(
      new Set(
        schema.pages.flatMap((page) =>
          page.children.flatMap(getComponentDependencies)
        )
      )
    );
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
    fs.writeFileSync(
      "package.json",
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
      "@types/react",
      "@types/react-native",
      "dotenv",
      "typescript"
    );
    await pm.installAsync();
    const expoInstall = spawnAsync("./node_modules/.bin/expo", [
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
    console.log("generating page on", process.cwd());
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
  } catch (e) {
    process.chdir(cwd);
    throw e;
  } finally {
    process.chdir(cwd);
  }
};

export default generateExpo;
