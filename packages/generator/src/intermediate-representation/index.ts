import { PageSchema } from "@batiq/core";
import { toVariableName } from "../utils/naming";
import { transformComponent } from "./component";
import { ComponentImport, Component, PageIR } from "./types";

export * from "./types";

const mergeImports = (imports: ComponentImport[]): ComponentImport[] =>
  imports.reduce(
    (carry, imp) =>
      carry.some((i) => i.source === imp.source)
        ? carry.map((c) =>
            c.source === imp.source
              ? {
                  ...c,
                  names: Array.from(new Set([...c.names, ...imp.names])),
                  default: c.default || imp.default,
                }
              : c
          )
        : carry.concat(imp),
    [] as ComponentImport[]
  );

export const transformIR = async (page: PageSchema): Promise<PageIR> => {
  const results = await Promise.all(
    page.children.map((component) => transformComponent(component, true))
  );
  const imports = mergeImports(results.flatMap((r) => r.imports));
  const root = {
    name: toVariableName(page.name),
    props: [],
    variableDeclarations: Object.fromEntries(
      results.flatMap((r) => r.variables)
    ),
    JSX: results.map((r) => r.element),
    root: true,
  } as Component;
  const additionalComponents = results.flatMap((r) => r.additionalComponents);
  return {
    imports,
    components: [root, ...additionalComponents],
  };
};
