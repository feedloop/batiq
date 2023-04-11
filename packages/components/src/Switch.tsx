import React from "react";
import { Static } from "@sinclair/typebox";
import { Switch as Switch_ } from "native-base";
import { Switch as SwitchDefinition } from "./definitions";

export const Switch = (props: Static<typeof SwitchDefinition.inputs>) => {
  const { initialValue, ...rest } = props;
  return <Switch_ {...rest} defaultIsChecked={initialValue} />;
};
