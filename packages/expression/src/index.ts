import React from "react";
import { useDataContext } from "@batiq/expo-runtime";
import { evaluate, mergeConfig } from "@feedloop/expression";
import javascriptConfig from "@feedloop/formula-prelude/evaluators/javascript";
import Dot from "dot-object";

const dot = new Dot(".");

export const evaluateExpression = (
  expression: string,
  additionalConfig: Partial<typeof javascriptConfig> = {}
) => evaluate(expression, mergeConfig(javascriptConfig, additionalConfig));

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
    ): any => {
      try {
        return evaluateExpression(
          expression,
          mergeConfig({ variables }, additionalConfig)
        );
      } catch (e) {
        return undefined;
      }
    },
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
