import { ActionDefinition, ActionSchema, ExpressionSchema } from "@batiq/core";
import Ajv from "ajv";
import {
  generateHookResultName,
  generateUniqueName,
  hookResultName,
} from "./utils/naming";
import { Component, ComponentImport, Value } from "./types";
import { importDefinition } from "./utils/importDefinition";
import { buildActionGraph } from "./action-graph";
import { Scope } from "./scope";

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
  scope: Scope,
  [name, value]: [string, ActionSchema[]],
  isRoot: boolean
): Promise<TransformPropResult> => {
  const graph = buildActionGraph(value);
  const imports = [
    {
      source: "@batiq/actions",
      names: ["useActionGraph"],
      default: null,
    },
    ...graph.nodes.map((node) => ({
      source: node.from,
      names: [node.name],
      default: null,
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
  const variables: [string, Value][] = actionDefs.flatMap(
    ({ node, isHook }): [string, Value][] => {
      if (!isHook) return [];
      const variableName = generateHookResultName(scope, node.name);
      scope.addVariable(variableName, {
        type: "function_call",
        arguments: [],
        name: node.name,
      });
      return isHook ? [[variableName, scope.getVariable(variableName)]] : [];
    }
  );
  const actionGraphVariable: [string, Value] = [
    generateHookResultName(scope, "useActionGraph"),
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
  ];

  const actionGraph: Value = {
    type: "variable",
    name: actionGraphVariable[0],
  };

  return {
    imports,
    variables: variables.concat([actionGraphVariable]),
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
  scope: Scope,
  [name, value]: [string, ActionSchema | ActionSchema[] | ExpressionSchema],
  isRoot: boolean
): Promise<TransformPropResult> => {
  if (Array.isArray(value)) {
    return transformActionGraphProp(scope, [name, value], isRoot);
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

      const imports = [
        {
          source: value.from,
          names: [value.name],
          default: null,
        },
      ];
      scope.addImport(value.from, [value.name], null);

      const hookCallVariableName = isHook
        ? generateHookResultName(scope, value.name)
        : null;
      const variables: [string, Value][] = hookCallVariableName
        ? [
            [
              hookCallVariableName,
              { type: "function_call", arguments: [], name: value.name },
            ],
          ]
        : [];
      if (hookCallVariableName) {
        scope.addVariable(hookCallVariableName, null);
      }

      return {
        imports,
        variables,
        prop: {
          name,
          value: {
            type: "function_call",
            name: hookCallVariableName ? hookCallVariableName : value.name,
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
      const hookCallVariableName = generateUniqueName(scope, "evaluate");
      return {
        imports: [
          { source: "@batiq/core", names: ["useExpression"], default: null },
        ],
        variables: [
          [
            hookCallVariableName,
            { type: "function_call", arguments: [], name: "useExpression" },
          ],
        ],
        prop: {
          name,
          value: {
            type: "function_call",
            name: hookCallVariableName,
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
  scope: Scope,
  props: [string, ActionSchema | ActionSchema[] | ExpressionSchema][],
  isRoot: boolean
): Promise<TransformPropsResult> => {
  const { results } = await props.reduce(
    async (promise, prop) => {
      const { scope, results } = await promise;
      const transformResult: TransformPropResult =
        await transformHookExpressionProp(scope, prop, isRoot);

      return {
        scope: scope,
        results: {
          imports: results.imports.concat(transformResult.imports),
          variables: results.variables.concat(transformResult.variables),
          props: results.props.concat(transformResult.prop),
          additionalComponents: results.additionalComponents.concat(
            transformResult.additionalComponents
          ),
          splitComponent:
            results.splitComponent || transformResult.splitComponent,
        },
      };
    },
    Promise.resolve({
      scope: scope,
      results: {
        imports: [],
        variables: [],
        props: [],
        additionalComponents: [],
        splitComponent: false,
      } as TransformPropsResult,
    })
  );

  return results;
};
