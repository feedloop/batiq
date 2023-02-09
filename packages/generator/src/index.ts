import { AppSchema } from "@batiq/core";
import { installExpo, generateExpo } from "./expo/generate";

export { transformIR } from "./intermediate-representation";

export const installApp = (
  schema: AppSchema,
  target: "expo" | "next" | "vite"
) => {
  switch (target) {
    case "expo":
      return installExpo(schema);
    default:
      throw Error("target not implemented");
  }
};

export const generateApp = (
  schema: AppSchema,
  target: "expo" | "next" | "vite"
) => {
  switch (target) {
    case "expo":
      return generateExpo(schema);
    default:
      throw Error("target not implemented");
  }
};
