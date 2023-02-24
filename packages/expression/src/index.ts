import React from "react";
import { useDataContext } from "@batiq/data";
import { buildExpressionParser, evaluate } from "@feedloop/expression-parser";
import { javascriptConfig, mergeConfig } from "@feedloop/formula-editor";
import Dot from "dot-object";

const dot = new Dot(".");

const parse = buildExpressionParser(javascriptConfig);

export const evaluateExpression = (
  expression: string,
  additionalConfig: Partial<typeof javascriptConfig> = {}
) => {
  const ast = parse(expression);
  return ast.errors.length === 0
    ? evaluate(ast.ast, mergeConfig(javascriptConfig, additionalConfig))
    : undefined;
};

export const useLazyExpression = () => {
  const data = useDataContext();
  const variables = React.useMemo(
    () =>
      Object.entries(dot.dot(data)).map(
        ([key, value]): (typeof javascriptConfig)["variables"][number] => ({
          name: key,
          type:
            typeof value === "string"
              ? "string"
              : typeof value === "number"
              ? "number"
              : typeof value === "boolean"
              ? "boolean"
              : "any",
          evaluate: () => value,
        })
      ),
    [data]
  );
  return React.useCallback(
    (
      expression: string,
      additionalConfig: Partial<typeof javascriptConfig> = {}
    ): any =>
      evaluateExpression(
        expression,
        mergeConfig(
          { functions: [], operators: [], variables },
          additionalConfig
        )
      ),
    [variables]
  );
};

export const useExpression = (expression: string) => {
  const lazyExpression = useLazyExpression();
  return React.useMemo(
    () => lazyExpression(expression),
    [lazyExpression, expression]
  );
};
