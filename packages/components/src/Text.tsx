import React from "react";
import { Text as Text_ } from "native-base";

const Text = ({
  children,
  text,
  ...rest
}: React.PropsWithChildren<{ text: string }>) => (
  <Text_ {...rest}>{text}</Text_>
);
// @ts-ignore
Text.inputs = {
  type: "object",
  properties: {},
};

export { Text };
