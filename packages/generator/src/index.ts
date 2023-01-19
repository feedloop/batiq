import { PageSchema } from "@batiq/core";
import { generate } from "./codegen";
import { transformIR } from "./transformIR";

export { generateNavigation } from "./navigation";

export const generatePage = async (page: PageSchema, format?: boolean) =>
  generate(await transformIR(page), format);
