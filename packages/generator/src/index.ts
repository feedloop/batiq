import { PageSchema } from "@batiq/core";
import { generate } from "./codegen";
import { transformIR } from "./transformIR";

export const generatePage = async (page: PageSchema) =>
  generate(await transformIR(page));
