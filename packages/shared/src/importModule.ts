/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import * as path from "path";

// esm.sh instance
const CDN_URL =
  "http://localhost:8080/{package}@{version}?alias=react-native:react-native-web";

const alias = {
  "react-native": "react-native-web",
  // "react-native-safe-area-context":
  //   "@batiq/esm-compat/react-native-safe-area-context",
  // "react-native-safe-area-context/lib/module/SafeAreaContext.js":
  //   "react-native-safe-area-context/lib/module/SafeAreaContext.web.js",
  // "react-native-safe-area-context/lib/module/SafeAreaView.js":
  //   "react-native-safe-area-context/lib/module/SafeAreaView.web.js",
};

/**
 * Import helper for dynamic imports
 * @param source import source
 * @returns module
 */
export const importModule = (source: string, version = "latest") => {
  // @ts-ignore
  if (process.env.NODE_ENV === "production") {
    return import(
      /* webpackIgnore: true */ CDN_URL.replace("{package}", source)
        .replace("{version}", version)
        .concat(
          `?alias=${Object.entries(alias)
            .map((keyValue) => keyValue.join(":"))
            .join(",")}`
        )
    ).catch((err) => {
      console.log("import error", source, err);
      throw err;
    });
  }

  switch (source) {
    case "@batiq/core":
      return import("@batiq/core");

    case "@batiq/data":
      return import("@batiq/data");
    case "@batiq/data/definitions.js":
      return import("@batiq/data/definitions.js");

    case "@batiq/components":
      return import("@batiq/components");
    case "@batiq/components/definitions.js":
      return import("@batiq/components/definitions.js");

    case "@batiq/actions":
      return import("@batiq/actions");
    case "@batiq/actions/definitions.js":
      return import("@batiq/actions/definitions.js");

    case "@batiq/expression":
      return import("@batiq/expression");

    case "@batiq/expo-runtime":
      return import("@batiq/expo-runtime");

    default:
      return import(
        /* webpackIgnore: true */ CDN_URL.replace("{package}", source).replace(
          "{version}",
          version
        )
      );
  }
};

export const importDefinition = async (source: string, name: string) => {
  const definitionPath = path.join(source, "definitions.js");
  return (
    await import(
      source.startsWith("./") ? `./${definitionPath}` : definitionPath
    ).catch(() => ({}))
  )[name];
};
