import { buildExpressionParser, evaluate } from "@feedloop/expression-parser";
import { javascriptConfig } from "@feedloop/formula-editor";

const parse = buildExpressionParser(javascriptConfig);

export const useExpression = (expression: string) => {
  const ast = parse(expression);
  return ast.errors.length === 0
    ? evaluate(ast.ast, javascriptConfig)
    : undefined;
};
