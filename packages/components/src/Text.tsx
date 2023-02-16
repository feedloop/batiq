import React from "react";
import { Text as Text_ } from "native-base";
import { Static } from "@sinclair/typebox";
import { Text as TextDefinition } from "./definitions";

type T = Static<typeof TextDefinition.inputs>;

const Text = ({ children, text, ...rest }: React.PropsWithChildren<T>) => (
  <Text_ {...rest}>{text}</Text_>
);

export { Text };
