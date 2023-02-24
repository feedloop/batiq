import React from "react";
import { useLazyExpression } from "@batiq/expression";
import Dot from "dot-object";

const dot = new Dot(".");

type ActionGraph = {
  nodes: (evaluate: ReturnType<typeof useLazyExpression>) => Promise<any>;
  successEdges: [number, number][];
  errorEdges: [number, number][];
};

export const useActionGraph = (graph: ActionGraph) => {
  const evaluate = useLazyExpression();

  return React.useCallback(() => {
    const run = async (node: number, ctx = {}) => {
      const next = graph.successEdges.find((e) => e[0] === node)?.[1];
      const error = graph.errorEdges.find((e) => e[0] === node)?.[0];

      const evaluateWithCtx = (expression: string) =>
        evaluate(expression, {
          variables: Object.entries(dot.dot(ctx)).map(([key, value]) => ({
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
          })),
        });
      let task = graph.nodes[node](evaluateWithCtx).then((run) => run());
      if (next) {
        task = task.then((result) => run(next, { ...ctx, result }));
      }
      if (error) {
        task = task.catch(() => run(error, ctx));
      }
      return task;
    };
    run(0);
  }, [evaluate]);
};
