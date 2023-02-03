import * as t from "@babel/types";
import { FunctionCall, transformIR, Value } from "./transformIR";
import { JSX, Component, ComponentImport, PageIR } from "./transformIR";
import { valueToAST } from "./utils/valueToAST";
import { PageSchema } from "@batiq/core";
import _babelGenerate from "@babel/generator";
import { toVariableName } from "./utils/naming";

// Babel is a CJS package and uses `default` as named binding (`exports.default =`).
// https://github.com/babel/babel/issues/15269
const babelGenerate =
  typeof _babelGenerate === "object"
    ? ((_babelGenerate as any)["default"] as typeof _babelGenerate)
    : _babelGenerate;

const primitiveIRToAST = (ir: Value): t.Expression => {
  if (Array.isArray(ir)) {
    return t.arrayExpression(ir.map(primitiveIRToAST));
  }
  if (typeof ir === "object") {
    if (ir.type === "function_call") {
      return t.callExpression(
        t.identifier((<FunctionCall>ir).name),
        (<FunctionCall>ir).arguments.map(primitiveIRToAST)
      );
    }
  }
  return valueToAST(ir);
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

const transformJSX = (JSX: JSX): t.JSXElement => {
  return t.jsxElement(
    t.jsxOpeningElement(
      t.jsxIdentifier(JSX.name),
      JSX.props.map((prop) =>
        t.jsxAttribute(
          t.jsxIdentifier(prop.name),
          t.jsxExpressionContainer(primitiveIRToAST(prop.value))
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

export const generatePage = async (page: PageSchema, format?: boolean) =>
  generate(await transformIR(page), format);
