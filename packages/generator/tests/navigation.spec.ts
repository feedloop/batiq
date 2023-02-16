import path from "node:path";
import glob from "fast-glob";
import { toMatchFile } from "jest-file-snapshot";
import { generateNavigation } from "../src/expo/navigation";

expect.extend({ toMatchFile });

describe("Navigation", () => {
  const files = glob.sync(
    path.join(__dirname, "cases/navigation/*/input.tsx"),
    { absolute: true }
  );

  files.forEach(async (file) => {
    test(path.basename(path.dirname(file)), async () => {
      const { input } = await import(file);
      expect(generateNavigation(input, true)).toMatchFile(
        file.replace("input.tsx", "output.tsx")
      );
    });
  });
});
