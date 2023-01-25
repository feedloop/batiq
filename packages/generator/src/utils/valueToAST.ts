import * as t from "@babel/types";

export const valueToAST = (value: any): t.Expression => {
  if (value === null) {
    return t.nullLiteral();
  }
  if (typeof value === "undefined") {
    return t.identifier("undefined");
  }
  if (typeof value === "string") {
    return t.stringLiteral(value);
  }
  if (typeof value === "number") {
    if (isNaN(value)) {
      return t.identifier("NaN");
    }
    if (value === Infinity) {
      return t.identifier("Infinity");
    }
    if (value === -Infinity) {
      return t.unaryExpression("-", t.identifier("Infinity"));
    }
    return t.numericLiteral(value);
  }
  if (typeof value === "boolean") {
    return t.booleanLiteral(value);
  }
  if (Array.isArray(value)) {
    return t.arrayExpression(value.map(valueToAST));
  }
  if (typeof value === "object") {
    return t.objectExpression(
      Object.entries(value).map(([key, value]) =>
        t.objectProperty(t.stringLiteral(key), valueToAST(value))
      )
    );
  }
  throw new Error(`Cannot convert value to AST: ${value}`);
};
