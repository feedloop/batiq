import React from "react";
import { Static } from "@sinclair/typebox";
import { Flex } from "native-base";
import { Container as ContainerDefinition } from "./definitions";

export const Container = (props: Static<typeof ContainerDefinition.inputs>) => {
  const { ...rest } = props;
  const direction = props.direction === "horizontal" ? "row" : "column";

  return <Flex {...rest} direction={direction} />;
};
