import React from "react";
import { AppSchema, PageSchema } from "@batiq/core";
import {
  transformIR,
  Component as ComponentIR,
  ComponentImport,
} from "@batiq/ir";
// @ts-ignore TODO: fix this
import { importModule } from "@batiq/shared";
import { valueToRuntime } from "./utils/valueToRuntime";
import { withComponentProvider } from "@batiq/expo-runtime";

export const toVariableName = (source: string): string =>
  source
    .split(/\W+/)
    .filter((word) => word.length > 0)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join("_");

export const resolveImport = (
  importSource: ComponentImport
): Promise<Record<string, any>> =>
  importModule(importSource.source).then((module) =>
    Object.fromEntries([
      ...(importSource.default
        ? [toVariableName(importSource.source), module.default]
        : []),
      ...importSource.names.map((name) => [name, module[name]]),
    ])
  );

export const createElement = (
  scope: Record<string, any>,
  jsx: ComponentIR["JSX"][number],
  index?: number
) => {
  const withPath = typeof index === "number";
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
        withPath ? withComponentProvider(index, component) : component,
        Object.fromEntries(
          jsx.props.map((prop) => [
            prop.name,
            valueToRuntime(scope, prop.value),
          ])
        ),
        ...jsx.children.map((child, i) =>
          createElement(scope, child, withPath ? i : undefined)
        )
      );
    }
    if (jsx.type === "render_prop") {
      return () => createElement(scope, jsx.JSX, withPath ? index : undefined);
    }
  }
  return jsx;
};

const PageComponent = (scope: Record<string, any>, component: ComponentIR) => {
  const componentFn = () => {
    scope = Object.entries(component.variableDeclarations).reduce(
      (scope, [name, value]) => {
        return {
          ...scope,
          [name]: valueToRuntime(scope, value),
        };
      },
      scope
    );

    return component.JSX.length > 1
      ? React.createElement(
          React.Fragment,
          {},
          ...component.JSX.map((jsx, i) => createElement(scope, jsx, i))
        )
      : createElement(scope, component.JSX[0], 0);
  };
  componentFn.displayName = component.name;
  return componentFn;
};

export const PageRuntime = async (
  app: AppSchema,
  page: PageSchema,
  scope: Record<string, any> = {}
): Promise<React.ComponentType> => {
  const ir = await transformIR(app, page, "native", false);
  scope = await ir.imports.reduce(
    async (carryP, importSource): Promise<Record<string, any>> =>
      Promise.all([carryP, resolveImport(importSource)]).then(
        ([carry, variables]) => ({
          ...carry,
          ...variables,
        })
      ),
    Promise.resolve(scope)
  );
  scope = Object.entries(ir.variableDeclarations).reduce(
    (scope, [name, value]) => ({
      ...scope,
      [name]: valueToRuntime(scope, value),
    }),
    scope
  );
  const components = await ir.components.reduceRight(
    async (scopeP, component, index) => {
      const scope = await scopeP;
      return {
        ...scope,
        [component.name]: withComponentProvider(
          index,
          PageComponent(scope, component)
        ),
      };
    },
    Promise.resolve(scope)
  );

  const rootComponent = ir.components.find((component) => component.root)!;
  return components[rootComponent.name];
};

export const PageRuntimeLazy = (props: {
  app: AppSchema;
  schema: PageSchema;
  scope?: Record<string, any>;
}) => {
  const PageComponent = React.useMemo(() => {
    const LazyComponent = async () =>
      PageRuntime(props.app, props.schema, props.scope).then((c) => ({
        default: c,
      }));
    LazyComponent.displayName = props.schema.name;
    return React.lazy(LazyComponent);
  }, [props.app, props.schema, props.scope]);
  return (
    <React.Suspense fallback="Loading...">
      <PageComponent />
    </React.Suspense>
  );
};
