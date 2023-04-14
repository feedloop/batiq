import React from "react";
import { Static } from "@sinclair/typebox";
import { Radio } from "native-base";
import {
  RadioGroup as RadioGroupDefinition,
  RadioItem as RadioItemDefinition,
} from ".";

type T = Static<typeof RadioItemDefinition.inputs>;

export const RadioGroup = (
  props: Static<typeof RadioGroupDefinition.inputs>
) => {
  const { name, ...rest } = props;
  return <Radio.Group {...rest} name={name} />;
};

export const RadioItem = ({
  children,
  value,
  ...rest
}: React.PropsWithChildren<T>) => {
  return (
    <Radio {...rest} value={value}>
      {children}
    </Radio>
  );
};
