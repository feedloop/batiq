import React from "react";
import { AppSchema } from "@batiq/core";
import { generateNavigationPageIR, Component as ComponentIR } from "@batiq/ir";
import { PageRuntimeLazy, resolveImport, toVariableName } from "./PageRuntime";
import { valueToRuntime } from "./utils/valueToRuntime";
import { useBatiqSchema } from "@batiq/expo-runtime";
import { Text, NativeBaseProvider } from "native-base";

const createElement = (
  scope: Record<string, any>,
  jsx: ComponentIR["JSX"][number]
) => {
  if (typeof jsx === "object") {
    if (jsx.type === "element") {
      const scopeVariable = Array.isArray(jsx.name) ? jsx.name[0] : jsx.name;
      const component =
        scopeVariable in scope
          ? Array.isArray(jsx.name)
            ? jsx.name.reduce((component, name) => component[name], scope)
            : scope[jsx.name]
          : jsx.name;
      return React.createElement(
        component,
        Object.fromEntries(
          jsx.props.map((prop) => [
            prop.name,
            valueToRuntime(scope, prop.value),
          ])
        ),
        ...jsx.children.map((child, i) => createElement(scope, child))
      );
    }
    if (jsx.type === "render_prop") {
      return () => createElement(scope, jsx.JSX);
    }
    if (jsx.type === "jsx_expression") {
      return valueToRuntime(scope, jsx.value);
    }
  }
  return jsx;
};

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
  scope?: Record<string, any>;
}) => {
  const schema = useBatiqSchema();
  const Navigation = React.useMemo(
    () =>
      React.lazy(async () =>
        NavigationRuntime(schema, props.scope).then((c) => ({
          default: c,
        }))
      ),
    [schema, props.scope]
  );
  return (
    <React.Suspense
      fallback={
        <NativeBaseProvider>
          <Text>Loading...</Text>
        </NativeBaseProvider>
      }
    >
      <Navigation />
    </React.Suspense>
  );
};
