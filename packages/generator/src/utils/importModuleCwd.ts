import path from "path";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

export const importModuleCwd = async (modulePath: string) => {
  const packageJson = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "node_modules", modulePath, "package.json"),
      "utf8"
    )
  );
  const main = packageJson.module ?? packageJson["jsnext:main"];
  if (main) {
    console.log("esm resolved", main);
    return await import(
      path.join(process.cwd(), "node_modules", modulePath, main)
    );
  } else {
    console.log(
      "commonjs resolved",
      packageJson.main ?? packageJson["react-native"]
    );
    return require(path.join(
      process.cwd(),
      "node_modules",
      modulePath,
      packageJson.main ?? packageJson["react-native"]
    ));
  }
};
