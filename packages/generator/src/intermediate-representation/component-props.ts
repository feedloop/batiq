import { ActionDefinition, ActionSchema, ExpressionSchema } from "@batiq/core";
import Ajv from "ajv";
import { hookResultName } from "../utils/naming";
import { Component, ComponentImport, Value } from "./types";

const ajv = new Ajv();

type TransformPropResult = {
  imports: ComponentImport[];
  variables: [string, Value][];
  prop: {
    name: string;
    value: Value;
  };
  splitComponent: boolean;
  additionalComponents: Component[];
};

export const transformHookExpressionProp = async (
  [name, value]: [string, ActionSchema | ExpressionSchema],
  isRoot: boolean
): Promise<TransformPropResult> => {
  switch (value.type) {
    case "action": {
      const actionDef: ActionDefinition = (await import(value.from))[
        value.name
      ];
      if (
        actionDef?.inputs &&
        !ajv.validate(actionDef.inputs, value.properties)
      ) {
        throw new Error(ajv.errorsText());
      }
      const isHook =
        (value.name.startsWith("use") && actionDef.isHook !== false) ||
        actionDef.isHook === true;

      return {
        imports: [
          {
            source: value.from,
            names: [value.name],
            default: false,
          },
        ],
        variables: isHook
          ? [
              [
                hookResultName(value.name),
                { type: "function_call", arguments: [], name: value.name },
              ],
            ]
          : [],
        prop: {
          name,
          value: {
            type: "function_call",
            name: isHook ? hookResultName(value.name) : value.name,
            arguments: value.properties,
          },
        },
        splitComponent:
          !isRoot && value.type === "action" && isHook && !!value.root,
        additionalComponents: [],
      };
    }

    case "expression": {
      return {
        imports: [
          { source: "@batiq/core", names: ["useExpression"], default: false },
        ],
        variables: [
          [
            "evaluate",
            { type: "function_call", arguments: [], name: "useExpression" },
          ],
        ],
        prop: {
          name,
          value: {
            type: "function_call",
            name: "evaluate",
            arguments: [value.expression],
          },
        },
        splitComponent: !isRoot,
        additionalComponents: [],
      };
    }
  }
};

type TransformPropsResult = {
  imports: ComponentImport[];
  variables: [string, Value][];
  props: {
    name: string;
    value: Value;
  }[];
  additionalComponents: Component[];
  splitComponent: boolean;
};

export const transformHookExpressionProps = async (
  props: [string, ActionSchema | ExpressionSchema][],
  isRoot: boolean
): Promise<TransformPropsResult> => {
  const propResults = await Promise.all(
    props.map((prop) => transformHookExpressionProp(prop, isRoot))
  );

  return {
    imports: propResults.flatMap((result) => result.imports),
    variables: propResults.flatMap((result) => result.variables),
    props: propResults.map((result) => result.prop),
    additionalComponents: propResults.flatMap(
      (result) => result.additionalComponents
    ),
    splitComponent: propResults.some((result) => result.splitComponent),
  };
};
