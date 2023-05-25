import React from "react";
import { AppSchema, BaseBatiqCore, PageSchema } from "@batiq/core";
import {
  transformIR,
  Component as ComponentIR,
  ComponentImport,
} from "@batiq/ir";
import { importModule } from "@batiq/import-helper";
import { valueToRuntime } from "./utils/valueToRuntime";
import { withComponentProvider, Runtime, useBatiq } from "@batiq/expo-runtime";
import { Text } from "react-native";

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

const createElement = (
  batiq: BaseBatiqCore & Runtime,
  scope: Record<string, any>,
  jsx: ComponentIR["JSX"][number],
  index: number
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
        batiq.decorateComponent(withComponentProvider(index, component)),
        Object.fromEntries(
          jsx.props.map((prop) => [
            prop.name,
            valueToRuntime(scope, prop.value),
          ])
        ),
        ...jsx.children.map((child, i) => createElement(batiq, scope, child, i))
      );
    }
    if (jsx.type === "render_prop") {
      return () => createElement(batiq, scope, jsx.JSX, index);
    }
    if (jsx.type === "jsx_expression") {
      return valueToRuntime(scope, jsx.value);
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

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const batiq = useBatiq<BaseBatiqCore & Runtime>();

    return component.JSX.length > 1
      ? React.createElement(
          React.Fragment,
          {},
          ...component.JSX.map((jsx, i) => createElement(batiq, scope, jsx, i))
        )
      : createElement(batiq, scope, component.JSX[0], 0);
  };
  componentFn.displayName = component.name;
  return componentFn;
};

export const PageRuntime = async (
  batiq: BaseBatiqCore & Runtime,
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
        [component.name]: batiq.decorateComponent(
          withComponentProvider(index, PageComponent(scope, component))
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
  const batiq = useBatiq<BaseBatiqCore & Runtime>();
  const PageComponent = React.useMemo(() => {
    const LazyComponent = async () =>
      PageRuntime(batiq, props.app, props.schema, props.scope).then((c) => ({
        default: c,
      }));
    LazyComponent.displayName = props.schema.name;
    return React.lazy(LazyComponent);
  }, [batiq, props.app, props.schema, props.scope]);
  return (
    <React.Suspense fallback={<Text>Loading...</Text>}>
      <PageComponent />
    </React.Suspense>
  );
};
