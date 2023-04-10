import React from "react";
import { Text as Text_ } from "native-base";
import { Static } from "@sinclair/typebox";
import { useLinkTo } from "@react-navigation/native";
import { Link as LinkDefinition } from ".";

type T = Static<typeof LinkDefinition.inputs>;

const Link = ({ children, text, to, ...rest }: React.PropsWithChildren<T>) => {
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

export { Link };
