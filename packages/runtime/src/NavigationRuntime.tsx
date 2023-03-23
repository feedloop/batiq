import React from "react";
import { AppSchema } from "@batiq/core";
import { generateNavigationPageIR, Component as ComponentIR } from "@batiq/ir";
import {
  createElement,
  PageRuntimeLazy,
  resolveImport,
  toVariableName,
} from "./PageRuntime";
import { valueToRuntime } from "./utils/valueToRuntime";

const PageComponent = async (
  scope: Record<string, any>,
  component: ComponentIR
) => {
  const componentFn = () => {
    scope = Object.entries(component.variableDeclarations).reduce(
      (carry, [name, value]) => {
        return {
          ...carry,
          [name]: value,
        };
      },
      scope
    );

    return component.JSX.length > 1
      ? React.createElement(
          React.Fragment,
          {},
          ...component.JSX.map((jsx) => createElement(scope, jsx))
        )
      : createElement(scope, component.JSX[0]);
  };
  componentFn.displayName = component.name;
  return componentFn;
};

export const NavigationRuntime = async (
  app: AppSchema,
  scope: Record<string, any> = {}
): Promise<React.ComponentType> => {
  const ir = generateNavigationPageIR(app);
  const imports = ir.imports.slice(
    0,
    ir.imports.findIndex((i) => i.source.startsWith("./pages"))
  );

  scope = await imports.reduce(
    async (carryP, importSource): Promise<Record<string, any>> =>
      Promise.all([carryP, resolveImport(importSource)]).then(
        ([carry, variables]) => ({
          ...carry,
          ...variables,
        })
      ),
    Promise.resolve(scope)
  );

  scope = app.pages.reduce(
    (scope, page) => ({
      ...scope,
      [toVariableName(`./pages/${toVariableName(page.name)}`)]: () =>
        React.createElement(PageRuntimeLazy, { app: app, schema: page, scope }),
    }),
    scope
  );

  scope = Object.entries(ir.variableDeclarations).reduce(
    (scope, [name, value]) => ({
      ...scope,
      [name]: valueToRuntime(scope, value),
    }),
    scope
  );

  const components = await ir.components.reduce(async (scopeP, component) => {
    const scope = await scopeP;
    return {
      ...scope,
      [component.name]: await PageComponent(scope, component),
    };
  }, Promise.resolve(scope));

  const rootComponent = ir.components.find((component) => component.root)!;
  return components[rootComponent.name];
};

export const NavigationRuntimeLazy = (props: {
  schema: AppSchema;
  scope?: Record<string, any>;
}) => {
  const Navigation = React.useMemo(
    () =>
      React.lazy(async () =>
        NavigationRuntime(props.schema, props.scope).then((c) => ({
          default: c,
        }))
      ),
    [props.schema, props.scope]
  );
  return (
    <React.Suspense fallback="Loading...">
      <Navigation />
    </React.Suspense>
  );
};
