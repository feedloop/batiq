import React from "react";
import { Text as Text_ } from "native-base";
import { Static, Type } from "@sinclair/typebox";
import { ComponentDefinition } from "@batiq/core";

const inputs = Type.Strict(
  Type.Object({
    text: Type.String(),
  })
);
type T = Static<typeof inputs>;

const Text: ComponentDefinition<T> = ({
  children,
  text,
  ...rest
}: React.PropsWithChildren<T>) => <Text_ {...rest}>{text}</Text_>;
// @ts-ignore
Text.inputs = inputs;

export { Text };
