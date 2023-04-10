import React from "react";
import { Button as NativeButton } from "native-base";
import { Static } from "@sinclair/typebox";
import { Button as ButtonDefinition } from ".";
import { useLinkTo } from "@react-navigation/native";

const ButtonLink = (props: Static<typeof ButtonDefinition.inputs>) => {
  const { to, ...rest } = props;
  const linkTo = useLinkTo();
  return (
    <NativeButton
      // @ts-ignore
      onPress={() => linkTo(to)}
      {...rest}
    />
  );
};

const Button = (props: Static<typeof ButtonDefinition.inputs>) => {
  const { to, ...rest } = props;
  return to ? <ButtonLink to={to} {...rest} /> : <NativeButton {...rest} />;
};

export { Button };
