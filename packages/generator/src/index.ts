import { AppSchema } from "@batiq/core";
import generateExpo from "./expo/generate";

export const generateApp = (
  schema: AppSchema,
  target: "expo" | "next" | "vite",
  output: string
) => {
  switch (target) {
    case "expo":
      return generateExpo(schema, output);
    default:
      throw Error("target not implemented");
  }
};
