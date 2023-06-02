import {
  AppSchema,
  ComponentDefinition,
  ComponentSchema,
  CompoundComponentSchema,
  Primitive,
  SlotSchema,
} from "@batiq/core";
import Ajv from "ajv";
import { importNamedModule } from "@batiq/import-helper";
import { generateDefaultImport, generateUniqueName } from "./utils/naming";
import { transformComponentProps } from "./component-props";
import { ComponentImport, Value, JSX, Component } from "./types";
import { Scope } from "./scope";

const ajv = new Ajv({
  useDefaults: true,
});

const resolveCompoundComponent = (
  compoundComponent: CompoundComponentSchema,
  schema: ComponentSchema
  // children: ComponentSchema["children"]
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
        children: compoundComponent.children.flatMap(
          (child): ComponentSchema["children"] =>
            typeof child === "object"
              ? child.type === "component"
                ? [resolveCompoundComponent(child, schema)]
                : [child]
              : [child]
        ),
      };

// TODO: create intermediate schema, type slot converted to removekey
const transformCompoundComponent = async (
  scope: Scope,
  app: AppSchema,
  definition: ComponentDefinition<"compound">,
  schema: ComponentSchema,
  options: Partial<{
    path: number[];
    isRoot: boolean;
    validate: boolean;
  }>
): Promise<TransformResult> => {
  const { path, isRoot, validate } = options;
  const children: ComponentSchema["children"] =
    Object.keys(definition.inputs ?? {}).length === 0
      ? schema.children
      : [
          {
            type: "component",
            from: "@batiq/expo-runtime",
            name: "RemoveKey",
            properties: {
              key: "props",
            },
            children: schema.children,
          },
        ];
  // const resolvedChildren: ComponentSchema = resolveCompoundComponent(
  //   definition.component,
  //   schema,
  //   children
  // );
  const compoundSchema: ComponentSchema =
    Object.keys(definition?.inputs ?? {}).length === 0
      ? resolveCompoundComponent(definition.component, schema)
      : ({
          type: "component",
          from: "@batiq/expo-runtime",
          name: "DataSource",
          properties: {
            name: "props",
            data: schema.properties,
          },
          children: [resolveCompoundComponent(definition.component, schema)],
        } as ComponentSchema);

  const transformResult = await transformComponent(
    scope,
    app,
    compoundSchema as any,
    {
      path,
      isRoot: true,
      validate,
    }
  );

  const childrenResults = await transformComponentChildren(
    scope,
    app,
    schema.children,
    {
      path,
      isRoot,
      validate,
    }
  );

  const componentName =
    schema.name ?? generateDefaultImport(scope, definition.component.from);
  return {
    imports: [...transformResult.imports, ...childrenResults.imports],
    variables: childrenResults.variables,
    element: {
      type: "element",
      name: generateUniqueName(scope, componentName),
      metadata: {},
      props: [],
      children: childrenResults.elements,
    },
    additionalComponents: [
      {
        name: generateUniqueName(scope, componentName),
        variableDeclarations: Object.fromEntries(transformResult.variables),
        JSX: [transformResult.element],
        root: false,
      },
      ...transformResult.additionalComponents,
      ...childrenResults.additionalComponents,
    ],
  };
};

type TransformComponentChildrenResult = {
  imports: ComponentImport[];
  variables: [string, Value][];
  elements: JSX[];
  additionalComponents: Component[];
};

export const transformComponentChildren = async (
  scope: Scope,
  app: AppSchema,
  schemas: (Primitive | SlotSchema)[],
  options: Partial<{
    path: number[];
    isRoot: boolean;
    validate: boolean;
  }>
): Promise<TransformComponentChildrenResult> => {
  const { path, isRoot = true, validate = false } = options;
  const components = await Promise.all(
    schemas.map(async (schema, i): Promise<TransformResult> => {
      if (typeof schema === "object" && schema.type === "slot") {
        return {
          imports: [],
          variables: [],
          element: {
            type: "jsx_expression",
            value: {
              type: "variable",
              name: "props.children",
            },
          },
          additionalComponents: [],
        };
      }

      return transformPrimitiveSchema(
        scope.clone(),
        app,
        schema,
        path ? path.concat(i) : undefined,
        false,
        validate
      );
    })
  );

  return {
    imports: components.flatMap((component) => component.imports),
    variables: components.flatMap((component) => component.variables),
    elements: components.map((component) => component.element),
    additionalComponents: components.flatMap(
      (component) => component.additionalComponents
    ),
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
  options: Partial<{
    path: number[];
    isRoot: boolean;
    validate: boolean;
  }>
): Promise<TransformResult> => {
  const { path, isRoot = true, validate = false } = options;
  const componentDefinition: ComponentDefinition =
    schema.from === "local" && schema.name
      ? app.components[schema.name]
      : await importNamedModule(schema.from, schema.name ?? "default");
  if (
    validate &&
    componentDefinition?.inputs &&
    !ajv.validate(componentDefinition.inputs, schema.properties)
  ) {
    throw new Error(ajv.errorsText());
  }

  if (componentDefinition?.component?.type === "component") {
    return transformCompoundComponent(scope, app, componentDefinition, schema, {
      isRoot,
      validate,
    });
  }

  const importSource =
    componentDefinition?.type === "component"
      ? {
          from: componentDefinition.component.from,
          name: componentDefinition.component.name,
        }
      : {
          from: schema.from,
          name: schema.name,
        };
  const componentName =
    importSource.name ?? generateDefaultImport(scope, importSource.from);
  const imports = [
    importSource.name
      ? {
          source: importSource.from,
          names: [importSource.name],
          default: null,
        }
      : {
          source: importSource.from,
          names: [],
          default: componentName,
        },
  ];
  if (importSource.name) {
    scope.addImport(importSource.from, [importSource.name], null);
  } else {
    scope.addImport(importSource.from, [], componentName);
  }

  const propsResult = await transformComponentProps(
    scope.clone(),
    schema.properties,
    isRoot
  );

  const childrenResults = await transformComponentChildren(
    scope,
    app,
    schema.children,
    {
      path,
      isRoot,
      validate,
    }
  );

  const variables = [...propsResult.variables, ...childrenResults.variables];

  const jsx: JSX = {
    type: "element",
    name: componentName,
    metadata:
      path && path.length > 0
        ? {
            path,
            isLeaf: schema.children.length === 0,
          }
        : {},
    props: propsResult.props,
    children: childrenResults.elements,
  };

  return {
    imports: [...imports, ...propsResult.imports, ...childrenResults.imports],
    variables: propsResult.splitComponent ? [] : variables,
    element: propsResult.splitComponent
      ? {
          type: "element",
          name: generateUniqueName(scope, componentName),
          metadata: {},
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
      ...childrenResults.additionalComponents,
    ],
  };
};

export const transformPrimitiveSchema = async (
  scope: Scope,
  app: AppSchema,
  schema: Primitive,
  path?: number[],
  isRoot = true,
  validate = false
): Promise<TransformResult> => {
  if (typeof schema === "object") {
    switch (schema.type) {
      case "component":
        return transformComponent(scope.clone(), app, schema, {
          path,
          isRoot,
          validate,
        });

      case "data":
        return transformComponent(
          scope.clone(),
          app,
          {
            type: "component",
            from: "@batiq/expo-runtime",
            name: "Query",
            properties: {
              data: schema.data,
              name: schema.name,
              query: schema.query,
            },
            children: schema.children,
          },
          {
            isRoot,
            validate,
          }
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
