import { ActionDefinition, ActionSchema, ExpressionSchema } from "@batiq/core";
import Ajv from "ajv";
import { hookResultName } from "./utils/naming";
import { Component, ComponentImport, Value } from "./types";
import { importDefinition } from "./utils/importDefinition";
import { buildActionGraph } from "./action-graph";

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

export const transformActionGraphProp = async (
  [name, value]: [string, ActionSchema[]],
  isRoot: boolean
): Promise<TransformPropResult> => {
  const graph = buildActionGraph(value);
  const imports = [
    {
      source: "@batiq/actions",
      names: ["useActionGraph"],
      default: false,
    },
    ...graph.nodes.map((node) => ({
      source: node.from,
      names: [node.name],
      default: false,
    })),
  ];
  const actionDefs = await Promise.all(
    graph.nodes.map(async (node) => {
      const actionDef: ActionDefinition = await importDefinition(
        node.from,
        node.name
      );
      if (
        actionDef?.inputs &&
        !ajv.validate(actionDef.inputs, node.arguments)
      ) {
        throw new Error(ajv.errorsText());
      }
      return {
        node,
        actionDef,
        isHook:
          (node.name.startsWith("use") && actionDef?.isHook !== false) ||
          actionDef?.isHook === true,
      };
    })
  );
  const variables: [string, Value][] = [
    ...actionDefs.flatMap(({ node, isHook }): [string, Value][] =>
      isHook
        ? [
            [
              hookResultName(node.name),
              { type: "function_call", arguments: [], name: node.name },
            ],
          ]
        : []
    ),
    [
      "actionGraph",
      {
        type: "function_call",
        arguments: [
          {
            nodes: actionDefs.map(
              ({ node, isHook }): Value => ({
                type: "function_definition",
                async: true,
                parameters: ["evaluate"],
                return: {
                  type: "function_call",
                  name: isHook ? hookResultName(node.name) : node.name,
                  arguments: node.arguments.map((arg) =>
                    !Array.isArray(arg) &&
                    typeof arg === "object" &&
                    arg.type === "expression"
                      ? {
                          type: "function_call",
                          name: "evaluate",
                          arguments: [arg.expression],
                        }
                      : arg
                  ),
                },
              })
            ),
            successEdges: graph.successEdges,
            errorEdges: graph.errorEdges,
          },
        ],
        name: "useActionGraph",
      },
    ],
  ];

  const actionGraph: Value = {
    type: "variable",
    name: "actionGraph",
  };

  return {
    imports,
    variables,
    prop: {
      name,
      value: actionGraph,
    },
    splitComponent:
      !isRoot &&
      actionDefs.some(
        (actionDef) =>
          actionDef.isHook && !!("root" in actionDef ? actionDef?.root : true)
      ),
    additionalComponents: [],
  };
};

export const transformHookExpressionProp = async (
  [name, value]: [string, ActionSchema | ActionSchema[] | ExpressionSchema],
  isRoot: boolean
): Promise<TransformPropResult> => {
  if (Array.isArray(value)) {
    return transformActionGraphProp([name, value], isRoot);
  }
  switch (value.type) {
    case "action": {
      const actionDef: ActionDefinition = await importDefinition(
        value.from,
        value.name
      );
      if (
        actionDef?.inputs &&
        !ajv.validate(actionDef.inputs, value.arguments)
      ) {
        throw new Error(ajv.errorsText());
      }
      const isHook =
        (value.name.startsWith("use") && actionDef?.isHook !== false) ||
        actionDef?.isHook === true;

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
            arguments: value.arguments,
          },
        },
        splitComponent:
          !isRoot &&
          value.type === "action" &&
          isHook &&
          !!("root" in actionDef ? actionDef?.root : true),
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
  props: [string, ActionSchema | ActionSchema[] | ExpressionSchema][],
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
