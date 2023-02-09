import React from "react";
import { PageSchema, ComponentSchema } from "@batiq/core";
import { transformIR } from "@batiq/generator/src/intermediate-representation";
import {
  Component as ComponentIR,
  ComponentImport,
} from "@batiq/generator/src/intermediate-representation/types";

export const toVariableName = (source: string): string =>
  source
    .split(/\W+/)
    .filter((word) => word.length > 0)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join("_");

const importModule = (source: string) => {
  // @ts-ignore
  if (process.env.NODE_ENV === "production") {
    return import(/* webpackIgnore: true */ source);
  }

  switch (source) {
    case "@batiq/data":
      return import("@batiq/data");

    case "@batiq/components":
      return import("@batiq/components");

    // case "@batiq/actions":
    //   return import("@batiq/actions");

    // case "@batiq/expression":
    //   return import("@batiq/expression");

    default:
      return import(/* webpackIgnore: true */ source);
  }
};

const resolveImport = (
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
  scope: Record<string, any>,
  jsx: ComponentIR["JSX"][number]
) => {
  if (typeof jsx === "object" && jsx.type === "element") {
    return React.createElement(
      jsx.name in scope ? scope[jsx.name] : jsx.name,
      {},
      jsx.children.map((child) => createElement(scope, child))
    );
  }
  return jsx;
};

const PageComponent = async (
  scope: Record<string, any>,
  component: ComponentIR
) => {
  const componentFn = () => {
    const componentScope = Object.entries(
      component.variableDeclarations
    ).reduce((carry, [name, value]) => {
      return {
        ...carry,
        [name]: value,
      };
    }, scope);

    return component.JSX.length > 1
      ? React.createElement(
          React.Fragment,
          {},
          component.JSX.map((jsx) => createElement(componentScope, jsx))
        )
      : createElement(componentScope, component.JSX[0]);
  };
  componentFn.displayName = component.name;
  return componentFn;
};

export const PageRuntime = async (
  page: PageSchema
): Promise<React.ComponentType> => {
  const ir = await transformIR(page, false);
  const scope = await ir.imports.reduce(
    async (carryP, importSource): Promise<Record<string, any>> =>
      Promise.all([carryP, resolveImport(importSource)]).then(
        ([carry, variables]) => ({
          ...carry,
          ...variables,
        })
      ),
    Promise.resolve({} as Record<string, any>)
  );
  const components = await ir.components.reduceRight(
    async (scopeP, component) => {
      const scope = await scopeP;
      return {
        ...scope,
        [component.name]: await PageComponent(scope, component),
      };
    },
    Promise.resolve(scope)
  );

  const rootComponent = ir.components.find((component) => component.root)!;
  return components[rootComponent.name];
};

export const PageRuntimeLazy = (props: { schema: PageSchema }) => {
  const PageComponent = React.lazy(async () =>
    PageRuntime(props.schema).then((c) => ({ default: c }))
  );
  return (
    <React.Suspense fallback="Loading...">
      <PageComponent />
    </React.Suspense>
  );
};
