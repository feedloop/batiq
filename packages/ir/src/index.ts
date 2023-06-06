import { AppSchema, PageSchema } from "@batiq/core";
import { toVariableName } from "./utils/naming";
import {
  transformComponentChildren,
  transformPrimitiveSchema,
} from "./component";
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
  app: AppSchema,
  page: PageSchema,
  target: AppSchema["platform"] = "native",
  validate = false
): Promise<PageIR> => {
  const scope = createScope();
  scope.addVariable(toVariableName(page.name), null);
  const pageWrapper = await transformComponentChildren(
    scope,
    app,
    [
      {
        type: "component",
        from:
          target === "native" ? "@batiq/expo-runtime" : "@batiq/vite-runtime",
        name: "PageWrapper",
        properties: {},
        children: [],
      },
    ],
    {
      isRoot: true,
      validate,
    }
  );
  const results = await transformComponentChildren(scope, app, page.children, {
    path: [],
    isRoot: true,
    validate,
  });
  const imports = mergeImports([...pageWrapper.imports, ...results.imports]);
  const root = {
    name: toVariableName(page.name),
    variableDeclarations: Object.fromEntries(results.variables),
    JSX: pageWrapper.elements.map((element, i) =>
      i === 0 && typeof element === "object"
        ? { ...element, children: results.elements }
        : element
    ),
    root: true,
  } as Component;
  return {
    imports,
    variableDeclarations: {},
    components: [root, ...results.additionalComponents],
  };
};
