/* eslint-disable @nx/enforce-module-boundaries */

// esm.sh instance
const CDN_URL =
  "http://localhost:8080/{package}@{version}?alias=react-native:react-native-web";

/**
 * Import helper for dynamic imports
 * @param source import source
 * @returns module
 */
let defaultImportModule = async (source: string, version = "latest") => {
  // @ts-ignore
  if (process.env.NODE_ENV === "production") {
    return import(
      /* webpackIgnore: true */ CDN_URL.replace("{package}", source).replace(
        "{version}",
        version
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

    case "@batiq/components":
      return import("@batiq/components");
    case "@batiq/components/elements":
      return import("@batiq/components/elements");

    case "@batiq/actions":
      return import("@batiq/actions");
    case "@batiq/actions/module":
      return import("@batiq/actions/module");

    case "@batiq/expression":
      return import("@batiq/expression");

    case "@batiq/expo-runtime":
      return import("@batiq/expo-runtime");
    case "@batiq/expo-runtime/actions":
      return import("@batiq/expo-runtime/actions");

    default:
      return import(
        /* webpackIgnore: true */ CDN_URL.replace("{package}", source).replace(
          "{version}",
          version
        )
      );
  }
};

export const importModule: typeof defaultImportModule = defaultImportModule;

export const setImportModule = (importModule: typeof defaultImportModule) => {
  defaultImportModule = importModule;
};

export const importNamedModule = async (source: string, name: string) => {
  return importModule(source)
    .catch(() => ({}))
    .then((module) => module[name]);
};
