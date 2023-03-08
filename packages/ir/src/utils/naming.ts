import { Scope } from "../scope";

export const generateDefaultImport = (scope: Scope, source: string): string => {
  const defaultImport = scope.getDefaultImport(source);
  return defaultImport || generateVariableName(scope, source);
};

const scopeAwareNameGenerator =
  (generator: (name: string) => string) =>
  (scope: Scope, name: string): string => {
    const unique = (name: string, counter = 0) => {
      const variableName = counter ? `${name}${counter}` : name;
      return scope.has(variableName) ? unique(name, counter + 1) : variableName;
    };
    return unique(generator(name));
  };
export const generateUniqueName = scopeAwareNameGenerator((name) => name);

export const toVariableName = (source: string): string =>
  source
    .split(/\W+/)
    .filter((word) => word.length > 0)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join("_");
export const generateVariableName = scopeAwareNameGenerator(toVariableName);

export const hookResultName = (name: string): string =>
  name.startsWith("use")
    ? name.slice(3, 4).toLowerCase() + name.slice(4)
    : name + "_";
export const generateHookResultName = scopeAwareNameGenerator(hookResultName);
