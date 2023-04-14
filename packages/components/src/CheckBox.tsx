import React from "react";
import { Static } from "@sinclair/typebox";
import { Checkbox as CheckBox_ } from "native-base";
import { CheckBox as CheckBoxDefinition } from "./definitions";

export const CheckBox = (props: Static<typeof CheckBoxDefinition.inputs>) => {
  const { initialValue, ...rest } = props;

  return <CheckBox_ value={initialValue} {...rest} />;
};
