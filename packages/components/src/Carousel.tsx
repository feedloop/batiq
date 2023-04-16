import { Static } from "@sinclair/typebox";
import React from "react";
import Swiper from "react-native-swiper";
import { Carousel as CarouselDefinition } from "./definitions";

type T = Static<typeof CarouselDefinition.inputs>;

export const Carousel = ({ children, ...rest }: React.PropsWithChildren<T>) => {
  return <Swiper {...rest}>{children}</Swiper>;
};
