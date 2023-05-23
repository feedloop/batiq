import React from "react";
import { Static } from "@sinclair/typebox";
import { Select } from "native-base";
import { Dropdown as DropdownDefinition } from ".";

export const Dropdown = (props: Static<typeof DropdownDefinition.inputs>) => {
  const { values } = props;
  return (
    <Select {...props.wrapperProps}>
      {values.map(({ label, value }, idx) => (
        <Select.Item {...props.itemProps} label={label} value={value} key={idx}/>
      ))}
    </Select>
  );
};
