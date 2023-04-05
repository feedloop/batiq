import {
  ActionDefinition,
  ActionSchema,
  ExpressionSchema,
  Property,
} from "@batiq/core";
import Ajv from "ajv";
import {
  generateHookResultName,
  generateUniqueName,
  hookResultName,
} from "./utils/naming";
import { Component, ComponentImport, Value } from "./types";
// @ts-ignore TODO: fix this
import { importDefinition } from "@batiq/shared";
import { buildActionGraph } from "./action-graph";
import { Scope } from "./scope";

const ajv = new Ajv();

type TransformPropResult = {
  imports: ComponentImport[];
  variables: [string, Value][];
  prop: Value;
  splitComponent: boolean;
  additionalComponents: Component[];
};

export const transformActionGraphProp = async (
  scope: Scope,
  value: ActionSchema[],
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
  const actionGraphVariableName = generateUniqueName(scope, "actionGraph");
  scope.addVariable(actionGraphVariableName, {
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
  });
  const actionGraphVariable: [string, Value] = [
    actionGraphVariableName,
    scope.getVariable(actionGraphVariableName),
  ];

  const actionGraph: Value = {
    type: "variable",
    name: actionGraphVariable[0],
  };

  return {
    imports,
    variables: variables.concat([actionGraphVariable]),
    prop: actionGraph,
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
  value: ActionSchema | ActionSchema[] | ExpressionSchema,
  isRoot: boolean
): Promise<TransformPropResult> => {
  if (Array.isArray(value)) {
    return transformActionGraphProp(scope, value, isRoot);
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

      const imports: ComponentImport[] = [
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

      const arguments_ = await Promise.all(
        value.arguments.map((arg) => transformComponentProp(scope, arg, isRoot))
      );
      return {
        imports: imports.concat(arguments_.flatMap((arg) => arg.imports)),
        variables: variables.concat(arguments_.flatMap((arg) => arg.variables)),
        prop: {
          type: "function_call",
          name: hookCallVariableName ? hookCallVariableName : value.name,
          arguments: arguments_.map((arg) => arg.prop),
        },
        splitComponent:
          (!isRoot &&
            value.type === "action" &&
            isHook &&
            !!(actionDef && "root" in actionDef ? actionDef?.root : true)) ||
          arguments_.some((arg) => arg.splitComponent),
        additionalComponents: arguments_.flatMap(
          (arg) => arg.additionalComponents
        ),
      };
    }

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
            { type: "function_call", arguments: [], name: "useLazyExpression" },
          ],
        ],
        prop: {
          type: "function_call",
          name: hookCallVariableName,
          arguments: [value.expression],
        },
        splitComponent: !isRoot,
        additionalComponents: [],
      };
    }
  }
};

export const transformComponentProp = async (
  scope: Scope,
  value: Property,
  isRoot: boolean
): Promise<TransformPropResult> => {
  if (Array.isArray(value)) {
    if (
      value.every(
        (item) =>
          !Array.isArray(item) &&
          typeof item === "object" &&
          item.type === "action"
      )
    ) {
      return transformHookExpressionProp(
        scope,
        value as ActionSchema[],
        isRoot
      );
    }
  } else if (
    typeof value === "object" &&
    (value.type === "expression" || value.type === "action")
  ) {
    return transformHookExpressionProp(
      scope,
      value as ExpressionSchema | ActionSchema,
      isRoot
    );
  } else if (typeof value === "object" && !("type" in value)) {
    const propertyResult = await Promise.all(
      Object.entries(value).map(async ([name, v]) => ({
        name,
        value: await transformComponentProp(scope, v, isRoot),
      }))
    );
    return {
      imports: propertyResult.flatMap((res) => res.value.imports),
      variables: propertyResult.flatMap((res) => res.value.variables),
      prop: Object.fromEntries(
        propertyResult.map((res) => [res.name, res.value.prop])
      ),
      splitComponent: propertyResult.some((prop) => prop.value.splitComponent),
      additionalComponents: propertyResult.flatMap(
        (prop) => prop.value.additionalComponents
      ),
    };
  }
  return {
    imports: [],
    variables: [],
    prop: value,
    splitComponent: false,
    additionalComponents: [],
  };
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

export const transformComponentProps = async (
  scope: Scope,
  props: [string, Property][],
  isRoot: boolean
): Promise<TransformPropsResult> => {
  const { results } = await props.reduce(
    async (promise, [name, value]) => {
      const { scope, results } = await promise;
      const transformResult: TransformPropResult = await transformComponentProp(
        scope,
        value,
        isRoot
      );

      return {
        scope: scope,
        results: {
          imports: results.imports.concat(transformResult.imports),
          variables: results.variables.concat(transformResult.variables),
          props: results.props.concat({ name, value: transformResult.prop }),
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
