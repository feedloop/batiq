import { Element } from "@batiq/ir";
import React from "react";
import { ElementSchemaProvider } from "./ElementProvider";
import { PathProvider } from "./PathProvider";

type DefaultProps = React.PropsWithChildren<any>;

export const withComponentProvider = <P = DefaultProps,>(
  index: number,
  Component: React.ComponentType<P>,
  elementSchema?: Element
) => {
  const ElementProvider: React.FC<{
    children: React.PropsWithChildren<any>;
  }> = (props) =>
    elementSchema ? (
      <ElementSchemaProvider schema={elementSchema}>
        {props.children}
      </ElementSchemaProvider>
    ) : (
      props.children
    );

  return (props: P) => (
    <ElementProvider>
      <PathProvider index={index}>
        {/* @ts-ignore */}
        <Component {...props} />
      </PathProvider>
    </ElementProvider>
  );
};
