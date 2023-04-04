import { useWindowDimensions } from "react-native";
import { useTheme } from "@react-navigation/native";

export const breakpoint = () => {
  const windowWidth = useWindowDimensions()?.width;
  // @ts-ignore temporary
  const { breakpoints: themeBreakpoints } = useTheme();

  return (breakpoints: { [breakpoint: string]: any }) => {
    const validBreakpoints = Object.fromEntries(
      Object.entries(themeBreakpoints as Record<string, number>)
        .filter(([breakpointName]) =>
          Object.prototype.hasOwnProperty.call(breakpoints, breakpointName)
        )
        .map(([themeBreakpointName, themeBreakpoint]) => [
          themeBreakpointName,
          {
            breakpoint: themeBreakpoint,
            value: breakpoints[themeBreakpointName],
          },
        ])
    );

    return Object.values(validBreakpoints).reduce(
      (currentValue, { breakpoint, value }) =>
        breakpoint <= windowWidth ? value : currentValue,
      null
    );
  };
};
