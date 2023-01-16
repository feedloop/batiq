import * as t from "@babel/types";
import { toVariableName } from "./transformIR";
import { Prop, JSX, Component, ComponentImport, PageIR } from "./transformIR";
import babelGenerate from "@babel/generator";

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

const transformExpression = (expression: Prop["value"]): t.Expression => {
  if (typeof expression === "string") {
    return t.stringLiteral(expression);
  }
  if (typeof expression === "number") {
    return t.numericLiteral(expression);
  }
  if (typeof expression === "boolean") {
    return t.booleanLiteral(expression);
  }
  if (Array.isArray(expression)) {
    return t.arrayExpression(expression.map(transformExpression));
  }
  if (typeof expression === "object") {
    return t.objectExpression(
      Object.entries(expression).map(([key, value]) =>
        t.objectProperty(t.identifier(key), transformExpression(value))
      )
    );
  }
  throw new Error("Unknown expression type");
};

const transformJSX = (JSX: JSX): t.JSXElement => {
  return t.jsxElement(
    t.jsxOpeningElement(
      t.jsxIdentifier(JSX.name),
      JSX.props.map((prop) =>
        t.jsxAttribute(
          t.jsxIdentifier(prop.name),
          t.jsxExpressionContainer(transformExpression(prop.value))
        )
      ),
      JSX.children.length === 0
    ),
    t.jsxClosingElement(t.jsxIdentifier(JSX.name)),
    JSX.children.map(transformJSX),
    JSX.children.length === 0
  );
};

const transformComponent = (component: Component): t.VariableDeclaration => {
  return t.variableDeclaration("const", [
    t.variableDeclarator(
      t.identifier(component.name),
      t.arrowFunctionExpression(
        [t.identifier("props")],
        t.blockStatement([
          t.returnStatement(
            component.JSX.length === 1
              ? transformJSX(component.JSX[0])
              : t.jsxFragment(
                  t.jsxOpeningFragment(),
                  t.jsxClosingFragment(),
                  component.JSX.map(transformJSX)
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
