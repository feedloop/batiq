import React from "react";
import { Static } from "@sinclair/typebox";
import { Image as Image_ } from "native-base";
import { Image as ImageDefinition } from "./definitions";

export const Image = (props: Static<typeof ImageDefinition.inputs>) => {
  const { src, fallbackSrc, ...rest } = props;
  
  return (
    <Image_
      {...rest}
      source={{
        uri: src,
      }}
      fallbackSource={{
        uri: fallbackSrc,
      }}
    />
  );
};
