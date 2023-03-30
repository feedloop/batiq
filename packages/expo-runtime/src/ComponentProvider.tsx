import React from "react";
import { PathProvider } from "./PathProvider";

export const withComponentProvider = <P extends object>(
  index: number,
  Component: React.ComponentType<P>
) => {
  return (props: P) => (
    <PathProvider index={index}>
      <Component {...props} />
    </PathProvider>
  );
};
