import React from "react";
import { Text as Text_ } from "native-base";
import { Static, Type } from "@sinclair/typebox";
import { useLinkTo } from "@react-navigation/native";
import { ComponentDefinition } from "@batiq/core";

const inputs = Type.Strict(
  Type.Object({
    text: Type.String(),
    to: Type.String(),
  })
);
type T = Static<typeof inputs>;

const Link: ComponentDefinition<T> = ({
  children,
  text,
  to,
  ...rest
}: React.PropsWithChildren<T>) => {
  const linkTo = useLinkTo();
  return (
    <Text_
      {...rest}
      // @ts-ignore
      onPress={() => linkTo(to)}
    >
      {text}
    </Text_>
  );
};
// @ts-ignore
Link.inputs = inputs;

export { Link };
