import path from "node:path";
import glob from "fast-glob";
import { toMatchFile } from "jest-file-snapshot";
import { generate } from "../src/codegen";

expect.extend({ toMatchFile });

describe("Code Generator", () => {
  const files = glob.sync(path.join(__dirname, "cases/codegen/*/input.ts"), {
    absolute: true,
  });

  files.forEach(async (file) => {
    test(path.basename(path.dirname(file)), async () => {
      const { input } = await import(file);
      const output = await generate(input, true);
      expect(output).toMatchFile(file.replace("input.ts", "output.tsx"));
    });
  });
});
