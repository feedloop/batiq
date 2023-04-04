import {
  Element,
  FunctionCall,
  FunctionDefinition,
  Value,
  Variable,
} from "@batiq/ir";
import React from "react";

export const valueToRuntime = (
  scope: Record<string, any>,
  value: Value
): any => {
  if (Array.isArray(value)) {
    return value.map((v) => valueToRuntime(scope, v));
  }
  if (typeof value === "object") {
    if (value.type === "element") {
      const { name, props, children } = value as Element;
      const component = Array.isArray(name)
        ? name.reduce((component, name) => component[name], scope)
        : scope[name];
      return React.createElement(
        component,
        Object.fromEntries(
          props.map((prop) => [prop.name, valueToRuntime(scope, prop.value)])
        ),
        ...children.map((child) => valueToRuntime(scope, child))
      );
    }
    if (value.type === "function_call") {
      const { object, name, arguments: args } = value as FunctionCall;
      const func = object ? valueToRuntime(scope, object)[name] : scope[name];
      if (typeof func !== "function") {
        throw new Error(`Function ${name} not found`);
      }
      return func(...args.map((arg) => valueToRuntime(scope, arg)));
    }
    if (value.type === "function_definition") {
      const {
        async,
        name,
        parameters,
        return: returnValue,
      } = value as FunctionDefinition;
      const func = async
        ? async (...args: any[]) => {
            scope = parameters.reduce(
              (scope, param, i) => ({
                ...scope,
                [param]: args[i],
              }),
              scope
            );
            return valueToRuntime(scope, returnValue);
          }
        : (...args: any[]) => {
            scope = parameters.reduce(
              (scope, param, i) => ({
                ...scope,
                [param]: args[i],
              }),
              scope
            );
            return valueToRuntime(scope, returnValue);
          };
      if (name) {
        scope[name] = func;
      }
      return func;
    }
    if (value.type === "variable") {
      const { name } = value as Variable;
      return scope[name];
    }
    if (value.type === "binary_operator") {
      const { operator, left, right } = value;
      const leftValue = valueToRuntime(scope, left);
      const rightValue = valueToRuntime(scope, right);
      switch (operator) {
        case "+":
          return leftValue + rightValue;
        case "-":
          return leftValue - rightValue;
        case "/":
          return leftValue / rightValue;
        case "%":
          return leftValue % rightValue;
        case "*":
          return leftValue * rightValue;
        case "**":
          return leftValue ** rightValue;
        case "&":
          return leftValue & rightValue;
        case "|":
          return leftValue | rightValue;
        case ">>":
          return leftValue >> rightValue;
        case ">>>":
          return leftValue >>> rightValue;
        case "<<":
          return leftValue << rightValue;
        case "^":
          return leftValue ^ rightValue;
        case "==":
          return leftValue == rightValue;
        case "===":
          return leftValue === rightValue;
        case "!=":
          return leftValue != rightValue;
        case "!==":
          return leftValue !== rightValue;
        case "in":
          return leftValue in rightValue;
        case "instanceof":
          return leftValue instanceof rightValue;
        case ">":
          return leftValue > rightValue;
        case "<":
          return leftValue < rightValue;
        case ">=":
          return leftValue >= rightValue;
        case "<=":
          return leftValue <= rightValue;
        case "|>":
          return rightValue(leftValue);
        case "||":
          return leftValue || rightValue;
        case "&&":
          return leftValue && rightValue;
        case "??":
          return leftValue ?? rightValue;
        default:
          throw new Error(`Unknown operator ${operator}`);
      }
    }
    if (value.type === "json") {
      return value.value;
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [
        key,
        valueToRuntime(scope, value),
      ])
    );
  }
  return value;
};
