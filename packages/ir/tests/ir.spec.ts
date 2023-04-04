import path from "node:path";
import glob from "fast-glob";
import { toMatchFile } from "jest-file-snapshot";
import { transformIR } from "../src";

expect.extend({ toMatchFile });

describe("Navigation", () => {
  const files = glob.sync(path.join(__dirname, "cases/ir/*/input.ts"), {
    absolute: true,
  });

  files.forEach(async (file) => {
    test(path.basename(path.dirname(file)), async () => {
      const { input } = await import(file);
      const output = await transformIR(input);
      expect(JSON.stringify(output, null, 2)).toMatchFile(
        file.replace("input.ts", "output.json")
      );
    });
  });
});
