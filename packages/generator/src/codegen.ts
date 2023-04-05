import * as t from "@babel/types";
import {
  FunctionCall,
  transformIR,
  Value,
  Component,
  ComponentImport,
  PageIR,
  Element,
  Variable,
  BinaryOperator,
  JSX,
  FunctionDefinition,
} from "@batiq/ir";
import { valueToAST } from "./utils/valueToAST";
import { AppSchema, PageSchema } from "@batiq/core";
import _babelGenerate from "@babel/generator";
import { toVariableName } from "./utils/naming";

// Babel is a CJS package and uses `default` as named binding (`exports.default =`).
// https://github.com/babel/babel/issues/15269
const babelGenerate =
  typeof _babelGenerate === "object"
    ? ((_babelGenerate as any)["default"] as typeof _babelGenerate)
    : _babelGenerate;

const jsxIdentifier = (
  name: string | string[]
): t.JSXIdentifier | t.JSXMemberExpression => {
  if (typeof name === "string") {
    return t.jsxIdentifier(name);
  }
  if (name.length < 2) {
    return t.jsxIdentifier(name[0]);
  }
  return name
    .slice(2)
    .reduce(
      (acc, part) => t.jsxMemberExpression(acc, t.jsxIdentifier(part)),
      t.jsxMemberExpression(t.jsxIdentifier(name[0]), t.jsxIdentifier(name[1]))
    );
};

const primitiveIRToAST = (ir: Value): t.Expression => {
  if (Array.isArray(ir)) {
    return t.arrayExpression(ir.map(primitiveIRToAST));
  }
  if (typeof ir === "object") {
    if (ir.type === "element") {
      const selfClosing = (<Element>ir).children.length === 0;
      return t.jsxElement(
        t.jsxOpeningElement(
          jsxIdentifier((<Element>ir).name),
          (<Element>ir).props.map(({ name, value }) =>
            t.jsxAttribute(
              t.jsxIdentifier(name),
              typeof value === "string"
                ? t.stringLiteral(value)
                : t.jsxExpressionContainer(primitiveIRToAST(value))
            )
          ),
          selfClosing
        ),
        selfClosing
          ? null
          : t.jsxClosingElement(jsxIdentifier((<Element>ir).name)),
        (<Element>ir).children.map(jsxIRToAST).map(expressionToJSXChild)
      );
    }
    if (ir.type === "function_call") {
      const { object, name, arguments: args } = <FunctionCall>ir;
      return t.callExpression(
        object
          ? t.memberExpression(primitiveIRToAST(object), t.identifier(name))
          : t.identifier(name),
        args.map(primitiveIRToAST)
      );
    }
    if (ir.type === "variable") {
      return t.identifier((<Variable>ir).name);
    }
    if (ir.type === "binary_operator") {
      const { operator, left, right } = <BinaryOperator>ir;
      if (operator === "||" || operator === "&&" || operator === "??") {
        return t.logicalExpression(
          operator,
          primitiveIRToAST(left),
          primitiveIRToAST(right)
        );
      }
      return t.binaryExpression(
        operator,
        primitiveIRToAST(left),
        primitiveIRToAST(right)
      );
    }
    if (ir.type === "function_definition") {
      const {
        name,
        parameters,
        return: returnValue,
        async,
      } = <FunctionDefinition>ir;
      return name
        ? t.functionExpression(
            t.identifier(name),
            parameters.map(t.identifier),
            t.blockStatement([
              t.returnStatement(primitiveIRToAST(returnValue)),
            ]),
            undefined,
            async
          )
        : t.arrowFunctionExpression(
            parameters.map(t.identifier),
            primitiveIRToAST(returnValue),
            async
          );
    }
    if (ir.type === "json") {
      return valueToAST(ir.value);
    }
    return t.objectExpression(
      Object.entries(<Record<string, Value>>ir).map(([key, value]) =>
        t.objectProperty(t.stringLiteral(key), primitiveIRToAST(value))
      )
    );
  }
  return valueToAST(ir);
};

export const jsxIRToAST = (jsx: JSX): t.Expression => {
  if (!Array.isArray(jsx) && typeof jsx === "object") {
    if (jsx.type === "render_prop") {
      return t.arrowFunctionExpression(
        jsx.parameters.map(t.identifier),
        primitiveIRToAST(jsx.JSX)
      );
    }
  }
  return primitiveIRToAST(jsx);
};

const transformImport = (imp: ComponentImport): t.ImportDeclaration => {
  return t.importDeclaration(
    [
      ...(imp.default
        ? [t.importDefaultSpecifier(t.identifier(toVariableName(imp.source)))]
        : []),
      ...imp.names.map((name): t.ImportDefaultSpecifier | t.ImportSpecifier =>
        t.importSpecifier(t.identifier(name), t.identifier(name))
      ),
    ],
    t.stringLiteral(imp.source)
  );
};

const expressionToJSXChild = (
  expression: t.Expression
):
  | t.JSXText
  | t.JSXExpressionContainer
  | t.JSXSpreadChild
  | t.JSXElement
  | t.JSXFragment => {
  if (t.isJSXElement(expression)) {
    return expression;
  }
  if (t.isStringLiteral(expression)) {
    return t.jsxText(expression.value);
  }
  return t.jsxExpressionContainer(expression);
};

const transformVariableDeclaration = (name: string, value: Value) => {
  return t.variableDeclaration("const", [
    t.variableDeclarator(t.identifier(name), primitiveIRToAST(value)),
  ]);
};

const transformComponent = (component: Component): t.VariableDeclaration => {
  return t.variableDeclaration("const", [
    t.variableDeclarator(
      t.identifier(component.name),
      t.arrowFunctionExpression(
        [t.identifier("props")],
        t.blockStatement([
          ...Object.entries(component.variableDeclarations).map(
            ([name, value]) =>
              t.variableDeclaration("const", [
                t.variableDeclarator(
                  t.identifier(name),
                  primitiveIRToAST(value)
                ),
              ])
          ),
          t.returnStatement(
            component.JSX.length === 1
              ? primitiveIRToAST(component.JSX[0])
              : t.jsxFragment(
                  t.jsxOpeningFragment(),
                  t.jsxClosingFragment(),
                  component.JSX.map(jsxIRToAST).map(expressionToJSXChild)
                )
          ),
        ])
      )
    ),
  ]);
};

export const transformToProgram = (ir: PageIR): t.Program => {
  return t.program(
    [
      ...ir.imports.map(transformImport),
      ...Object.entries(ir.variableDeclarations || {}).map(([name, value]) =>
        transformVariableDeclaration(name, value)
      ),
      ...ir.components.map(transformComponent),
      t.exportDefaultDeclaration(
        t.identifier(ir.components.find((c) => c.root)!.name)
      ),
    ],
    [],
    "module"
  );
};

export const generate = async (ir: PageIR, format = false): Promise<string> => {
  const { code } = babelGenerate(transformToProgram(ir));
  if (!format) {
    return code;
  }
  const prettier = await import("prettier");
  return prettier.format(code, { parser: "babel" });
};

export const generatePage = async (
  app: AppSchema,
  page: PageSchema,
  format?: boolean
) => generate(await transformIR(app, page), format);
