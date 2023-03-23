import path from "path";
import glob from "fast-glob";
import { toMatchFile } from "jest-file-snapshot";
import { transformIR } from "../src";
import { AppSchema } from "@batiq/core";

expect.extend({ toMatchFile });

describe("Navigation", () => {
  const files = glob.sync(path.join(__dirname, "cases/ir/*/input.ts"), {
    absolute: true,
  });

  files.forEach(async (file) => {
    test(path.basename(path.dirname(file)), async () => {
      const { input, components } = await import(file);
      const dummyApp: AppSchema = { components };
      const output = await transformIR(dummyApp, input);
      expect(JSON.stringify(output, null, 2)).toMatchFile(
        file.replace("input.ts", "output.json")
      );
    });
  });
});
