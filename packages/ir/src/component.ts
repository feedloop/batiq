import {
  AppSchema,
  ComponentDefinition,
  ComponentSchema,
  CompoundComponentSchema,
  Primitive,
} from "@batiq/core";
import Ajv from "ajv";
import { importComponent, importDefinition } from "./utils/importDefinition";
import { generateDefaultImport, generateUniqueName } from "./utils/naming";
import { transformComponentProps } from "./component-props";
import { ComponentImport, Value, JSX, Component } from "./types";
import { Scope } from "./scope";

const ajv = new Ajv({
  useDefaults: true,
});

const resolveCompoundComponent = (
  compoundComponent: CompoundComponentSchema,
  schema: ComponentSchema,
  children: ComponentSchema["children"]
): ComponentSchema =>
  schema.overrideComponents &&
  compoundComponent.id &&
  compoundComponent.id in schema.overrideComponents
    ? schema.overrideComponents[compoundComponent.id]
    : {
        type: "component",
        from: compoundComponent.from,
        name: compoundComponent.name,
        properties:
          compoundComponent.id &&
          schema.overrideProperties &&
          compoundComponent.id in schema.overrideProperties
            ? {
                ...compoundComponent.properties,
                ...schema.overrideProperties[compoundComponent.id],
              }
            : compoundComponent.properties,
        children: compoundComponent.children.flatMap((child) =>
          typeof child === "object"
            ? child.type === "component"
              ? [resolveCompoundComponent(child, schema, children)]
              : child.type === "slot"
              ? children
              : [child]
            : [child]
        ),
      };

const transformCompoundComponent = async (
  compoundComponent: CompoundComponentSchema,
  definition: ComponentDefinition | null,
  schema: ComponentSchema
): Promise<ComponentSchema> => {
  const children: ComponentSchema["children"] =
    Object.keys(definition?.inputs ?? {}).length === 0
      ? schema.children
      : [
          {
            type: "component",
            from: "@batiq/data",
            name: "RemoveKey",
            properties: {
              key: "props",
            },
            children: schema.children,
          },
        ];
  const resolvedComponent: ComponentSchema = resolveCompoundComponent(
    compoundComponent,
    schema,
    children
  );
  return Object.keys(definition?.inputs ?? {}).length === 0
    ? resolvedComponent
    : {
        type: "component",
        from: "@batiq/data",
        name: "DataSource",
        properties: {
          name: "props",
          data: schema.properties,
        },
        children: [resolvedComponent],
      };
};

type TransformResult = {
  imports: ComponentImport[];
  variables: [string, Value][];
  element: JSX;
  additionalComponents: Component[];
};

export const transformComponent = async (
  scope: Scope,
  app: AppSchema,
  schema: ComponentSchema,
  isRoot = true,
  validate: boolean
): Promise<TransformResult> => {
  const componentDefinition =
    schema.from === "local" && schema.name
      ? app.components[schema.name]?.definitions
      : await importDefinition(schema.from, schema.name ?? "default");
  if (
    validate &&
    componentDefinition?.inputs &&
    !ajv.validate(componentDefinition.inputs, schema.properties)
  ) {
    throw new Error(ajv.errorsText());
  }

  const component =
    schema.from === "local" && schema.name
      ? app.components[schema.name]?.component
      : await importComponent(schema.from, schema.name ?? "default");
  if (
    !Array.isArray(component) &&
    component !== null &&
    typeof component === "object"
  ) {
    schema = await transformCompoundComponent(
      component,
      componentDefinition,
      schema
    );
  }

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
      transformJSXChild(scope.clone(), app, component, false, validate)
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
  app: AppSchema,
  schema: Primitive,
  isRoot = true,
  validate: boolean
): Promise<TransformResult> => {
  if (typeof schema === "object") {
    switch (schema.type) {
      case "component":
        return transformComponent(scope.clone(), app, schema, isRoot, validate);

      case "data":
        return transformComponent(
          scope.clone(),
          app,
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

      case "expression": {
        const hookCallVariableName = generateUniqueName(scope, "evaluate");
        return {
          imports: [
            {
              source: "@batiq/expression",
              names: ["useLazyExpression"],
              default: null,
            },
          ],
          variables: [
            [
              hookCallVariableName,
              {
                type: "function_call",
                arguments: [],
                name: "useLazyExpression",
              },
            ],
          ],
          element: {
            type: "jsx_expression",
            value: {
              type: "function_call",
              name: hookCallVariableName,
              arguments: [schema.expression],
            },
          },
          additionalComponents: [],
        };
      }
    }
  }
  return {
    imports: [],
    variables: [],
    element: schema,
    additionalComponents: [],
  };
};
