export const toVariableName = (source: string): string =>
  source
    .split(/\W+/)
    .filter((word) => word.length > 0)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join("_");

export const hookResultName = (name: string): string =>
  name.startsWith("use")
    ? name.slice(3, 4).toLowerCase() + name.slice(4)
    : name + "_";
