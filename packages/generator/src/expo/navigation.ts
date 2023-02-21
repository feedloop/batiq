import { AppSchema } from "@batiq/core";
import { generateNavigationPageIR } from "@batiq/ir";
import { generate } from "../codegen";

export const generateNavigation = async (schema: AppSchema): Promise<string> =>
  await generate(generateNavigationPageIR(schema), true);
