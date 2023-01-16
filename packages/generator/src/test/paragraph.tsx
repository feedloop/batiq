import { PropsWithChildren } from "react";
import { ComponentDefinition } from "@batiq/core";

export const Paragraph: ComponentDefinition<{ color: string }> = (
  props: PropsWithChildren<{ color: string }>
) => {
  return <p style={{ color: props.color }}>{props.children}</p>;
};

Paragraph.inputs = {
  type: "object",
  properties: {
    color: {
      type: "string",
    },
  },
  required: ["color"],
};

export default Paragraph;
