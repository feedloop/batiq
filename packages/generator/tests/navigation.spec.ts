import glob from "tiny-glob";
import path from "node:path";
import { toMatchFile } from "jest-file-snapshot";
import { generateNavigation } from "../src/navigation";

expect.extend({ toMatchFile });

describe("Navigation", () => {
  it("askdjasd", async () => {
    const files = await glob(
      path.join(__dirname, "cases/navigation/*/input.tsx"),
      { absolute: true }
    );

    files.forEach(async (file) => {
      const { input } = await import(file);
      expect(generateNavigation(input, true)).toMatchFile(
        file.replace("input.tsx", "output.tsx")
      );
    });
  });
});
