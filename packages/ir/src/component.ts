import { ComponentDefinition, ComponentSchema, Primitive } from "@batiq/core";
import Ajv from "ajv";
import { importDefinition } from "./utils/importDefinition";
import { generateDefaultImport, generateUniqueName } from "./utils/naming";
import { transformComponentProps } from "./component-props";
import { ComponentImport, Value, JSX, Component } from "./types";
import { Scope } from "./scope";

const ajv = new Ajv();

type TransformResult = {
  imports: ComponentImport[];
  variables: [string, Value][];
  element: JSX;
  additionalComponents: Component[];
};

export const transformComponent = async (
  scope: Scope,
  schema: ComponentSchema,
  isRoot = true,
  validate: boolean
): Promise<TransformResult> => {
  const properties = Object.fromEntries(
    Object.entries(schema.properties).map(([key, value]) => [
      key,
      !Array.isArray(value) &&
      typeof value === "object" &&
      value.type === "breakpoint"
        ? {
            type: "action",
            from: "./test",
            name: "breakpoint",
            arguments: [value.breakpoints],
          }
        : value,
    ])
  );
  if (validate) {
    const component: ComponentDefinition<Record<string, any>> =
      await importDefinition(schema.from, schema.name ?? "default");
    if (component?.inputs && !ajv.validate(component.inputs, properties)) {
      throw new Error(ajv.errorsText());
    }
  }

  const componentName =
    schema.name ?? generateDefaultImport(scope, schema.from);
  const imports = [
    schema.name
      ? {
          source: schema.from,
          names: [schema.name],
          default: null,
        }
      : {
          source: schema.from,
          names: [],
          default: componentName,
        },
  ];
  if (schema.name) {
    scope.addImport(schema.from, [schema.name], null);
  } else {
    scope.addImport(schema.from, [], componentName);
  }

  const propsResult = await transformComponentProps(
    scope.clone(),
    Array.from(Object.entries(properties)),
    isRoot
  );

  const childrenResults = await Promise.all(
    schema.children.map((component) =>
      // transformComponent(scope.clone(), component, false, validate)
      transformJSXChild(scope.clone(), component, false, validate)
    )
  );

  const variables = [
    ...propsResult.variables,
    ...childrenResults.flatMap((result) => result.variables),
  ];

  const jsx: JSX = {
    type: "element",
    name: componentName,
    props: propsResult.props,
    children: childrenResults.map((result) => result.element),
  };

  return {
    imports: [
      ...imports,
      ...propsResult.imports,
      ...childrenResults.flatMap((result) => result.imports),
    ],
    variables: propsResult.splitComponent ? [] : variables,
    element: propsResult.splitComponent
      ? {
          type: "element",
          name: generateUniqueName(scope, componentName),
          props: [],
          children: [],
        }
      : jsx,
    additionalComponents: [
      ...(propsResult.splitComponent
        ? [
            {
              name: generateUniqueName(scope, componentName),
              variableDeclarations: Object.fromEntries(variables),
              JSX: [jsx],
              root: false,
            },
          ]
        : []),
      ...propsResult.additionalComponents,
      ...childrenResults.flatMap((result) => result.additionalComponents),
    ],
  };
};

export const transformJSXChild = async (
  scope: Scope,
  schema: Primitive,
  isRoot = true,
  validate: boolean
): Promise<TransformResult> => {
  if (typeof schema === "object") {
    switch (schema.type) {
      case "component":
        return transformComponent(scope.clone(), schema, isRoot, validate);

      case "data":
        return transformComponent(
          scope.clone(),
          {
            type: "component",
            from: "@batiq/data",
            name: "Query",
            properties: {
              data: schema.data,
              name: schema.name,
              query: schema.query,
            },
            children: schema.children,
          },
          isRoot,
          validate
        );

      case "expression":
        return {
          imports: [],
          variables: [],
          element: {
            type: "jsx_expression",
            value: false,
          },
          additionalComponents: [],
        };
    }
  }
  return {
    imports: [],
    variables: [],
    element: schema,
    additionalComponents: [],
  };
};
