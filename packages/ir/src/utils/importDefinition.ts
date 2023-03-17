export const importModule = (source: string) => {
  switch (source) {
    case "@batiq/data":
      return import("@batiq/data");

    case "@batiq/components":
      return import("@batiq/components");

    case "@batiq/actions":
      return import("@batiq/actions");

    case "@batiq/actions/definitions.js":
      return import("@batiq/actions/definitions.js");

    case "@batiq/expression":
      return import("@batiq/expression");

    case "@react-navigation/native":
      return import("@react-navigation/native");

    case "@react-navigation/native-stack":
      return import("@react-navigation/native-stack");

    case "@react-navigation/bottom-tabs":
      return import("@react-navigation/bottom-tabs");

    default:
      return import(source);
  }
};

export const importComponent = async (source: string, name: string) => {
  return (await importModule(source).catch(() => ({})))[name];
};

export const importDefinition = async (source: string, name: string) => {
  const definitionPath =
    source + (source.endsWith("/") ? "" : "/") + "definitions.js";
  return (await importModule(definitionPath).catch(() => ({})))[name];
};
