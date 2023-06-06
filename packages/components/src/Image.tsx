import React from "react";
import { Static } from "@sinclair/typebox";
import { Image as Image_ } from "native-base";
import { Image as ImageDefinition } from ".";

export const Image = (props: Static<typeof ImageDefinition.inputs>) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { src, fallbackSrc, children, ...rest } = props;

  return (
    <Image_
      {...rest}
      alt="Image"
      source={{
        uri: src,
      }}
      fallbackSource={{
        uri: fallbackSrc,
      }}
    />
  );
};
