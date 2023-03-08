import { PageSchema } from "@batiq/core";
import { toVariableName } from "./utils/naming";
import { transformComponent } from "./component";
import { ComponentImport, Component, PageIR } from "./types";
import { createScope } from "./scope";

export * from "./types";
export { generateNavigationPageIR } from "./expo-navigation";

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

export const transformIR = async (
  page: PageSchema,
  validate = false
): Promise<PageIR> => {
  const scope = createScope();
  scope.addVariable(toVariableName(page.name), null);
  const results = await Promise.all(
    page.children.map((component) =>
      transformComponent(scope.clone(), component, true, validate)
    )
  );
  const imports = mergeImports(results.flatMap((r) => r.imports));
  const root = {
    name: toVariableName(page.name),
    variableDeclarations: Object.fromEntries(
      results.flatMap((r) => r.variables)
    ),
    JSX: results.map((r) => r.element),
    root: true,
  } as Component;
  const additionalComponents = results.flatMap((r) => r.additionalComponents);
  return {
    imports,
    variableDeclarations: {},
    components: [root, ...additionalComponents],
  };
};
