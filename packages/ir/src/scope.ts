import { ComponentImport } from "./types";

export const createScope = (
  variables: Map<string, any> = new Map(),
  imports: Map<string, ComponentImport> = new Map()
) => {
  const scope = {
    clone: () => createScope(new Map(variables), imports),
    keys: () =>
      Array.from(variables.keys()).concat(
        Array.from(imports.values()).flatMap((imp) =>
          imp.names.concat(imp.default ? imp.default : [])
        )
      ),
    has: (key: string) => scope.keys().includes(key),
    hasNamedImport: (source: string, name: string) =>
      imports.has(source) && imports.get(source)?.names.includes(name),
    getDefaultImport: (source: string) =>
      imports.has(source) && imports.get(source)?.default,
    getVariable: (key: string) => variables.get(key),
    addVariable: (name: string, value: any) => {
      variables.set(name, value);
    },
    addImport: (
      source: string,
      names: string[],
      defaultImport: string | null
    ) => {
      const existingImport = imports.get(source);
      if (!existingImport) {
        imports.set(source, {
          source,
          names,
          default: defaultImport,
        });
      } else {
        if (
          existingImport.default !== null &&
          defaultImport !== null &&
          existingImport.default !== defaultImport
        ) {
          throw new Error(`Multiple default imports from ${source}`);
        }
        imports.set(source, {
          ...existingImport,
          names: Array.from(new Set([...existingImport.names, ...names])),
          default: defaultImport,
        });
      }
    },
  };

  return scope;
};

export type Scope = ReturnType<typeof createScope>;
