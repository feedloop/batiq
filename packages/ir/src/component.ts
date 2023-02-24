import {
  ActionSchema,
  ComponentDefinition,
  ComponentSchema,
  ExpressionSchema,
  Value as SchemaValue,
} from "@batiq/core";
import Ajv from "ajv";
import { importDefinition } from "./utils/importDefinition";
import { toVariableName } from "./utils/naming";
import { transformHookExpressionProps } from "./component-props";
import { ComponentImport, Value, JSX, Component } from "./types";

const ajv = new Ajv();

type TransformResult = {
  imports: ComponentImport[];
  variables: [string, Value][];
  element: JSX;
  additionalComponents: Component[];
};

export const transformComponent = async (
  schema: ComponentSchema,
  isRoot = true,
  validate: boolean
): Promise<TransformResult> => {
  if (validate) {
    const component: ComponentDefinition<Record<string, any>> =
      await importDefinition(schema.from, schema.name ?? "default");
    if (
      component?.inputs &&
      !ajv.validate(component.inputs, schema.properties)
    ) {
      throw new Error(ajv.errorsText());
    }
  }

  const imports = [
    schema.name
      ? {
          source: schema.from,
          names: [schema.name],
          default: false,
        }
      : { source: schema.from, names: [], default: true },
  ];

  const primitives = Object.entries(schema.properties).filter(
    (entry): entry is [string, SchemaValue] =>
      Array.isArray(entry[1])
        ? !entry[1].some(
            (item) =>
              !Array.isArray(item) &&
              typeof item === "object" &&
              item.type === "action"
          )
        : !(
            typeof entry[1] === "object" &&
            (entry[1].type === "action" || entry[1].type === "expression")
          )
  );
  const actionAndExpressions = Object.entries(schema.properties).filter(
    (
      entry
    ): entry is [string, ActionSchema | ActionSchema[] | ExpressionSchema] =>
      Array.isArray(entry[1])
        ? entry[1].every((item) =>
            Array.isArray(item)
              ? item.every(
                  (i) =>
                    !Array.isArray(i) &&
                    typeof i === "object" &&
                    i.type === "action"
                )
              : typeof item === "object" && item.type === "action"
          )
        : typeof entry[1] === "object" &&
          (entry[1].type === "action" || entry[1].type === "expression")
  );

  const props = primitives.map(
    ([name, value]): { name: string; value: Value } => ({
      name,
      value,
    })
  );

  const propsResult = await transformHookExpressionProps(
    actionAndExpressions,
    isRoot
  );

  const childrenResults = await Promise.all(
    schema.children
      .filter(
        (component): component is ComponentSchema =>
          typeof component === "object" && component.type === "component"
      )
      .map((component) => transformComponent(component, false, validate))
  );

  const variables = [
    ...propsResult.variables,
    ...childrenResults.flatMap((result) => result.variables),
  ];

  const jsx: JSX = {
    type: "element",
    name: schema.name ?? toVariableName(schema.from),
    props: [...props, ...propsResult.props],
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
          name: (schema.name ?? toVariableName(schema.from)) + "_",
          props: [],
          children: [],
        }
      : jsx,
    additionalComponents: [
      ...(propsResult.splitComponent
        ? [
            {
              name: (schema.name ?? toVariableName(schema.from)) + "_",
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
