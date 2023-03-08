import { useWindowDimensions } from "react-native";
import { useTheme } from "@react-navigation/native";

export const breakpoint = () => {
  const windowWidth = useWindowDimensions()?.width;
  // @ts-ignore temporary
  const { breakpoints: themeBreakpoints } = useTheme();

  return (breakpoints: { [breakpoint: string]: any }) => {
    const isValid = Object.keys(breakpoints).every((breakpoint) =>
      Object.prototype.hasOwnProperty.call(themeBreakpoints, breakpoint)
    );
    if (isValid) {
      const widths = Object.values(
        themeBreakpoints as Record<string, number>
      ).sort();
      const breakpointsMap = new Map(
        widths.map((dimValue, i) => [dimValue, i])
      );
      const currentBreakpoint = Array.from(breakpointsMap.keys()).reduce(
        (index: number, breakpoint, i): number => {
          if (breakpoint === windowWidth) {
            return breakpointsMap.get(breakpoint) ?? index;
          } else if (breakpoint > windowWidth && i !== 0) {
            return breakpointsMap.get(widths[i - 1]) ?? index;
          }
          return index;
        },
        breakpointsMap.get(widths[widths.length - 1]) ?? -1
      );

      const values = Object.keys(themeBreakpoints).map(
        (breakpointName) => breakpoints[breakpointName]
      );
      return (
        values[currentBreakpoint] ??
        values
          .slice(0, currentBreakpoint + 1)
          .filter((v: any) => v !== null && v !== undefined)
          .pop()
      );
    } else {
      return breakpoints;
    }
  };
};
