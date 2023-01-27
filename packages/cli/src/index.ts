import fs from "node:fs";
import path from "node:path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { generateApp } from "@batiq/generator";
import { AppSchema } from "@batiq/core";

export const main = (argv: string[]) => {
  yargs(hideBin(argv))
    .command(
      "generate <schema>",
      "generate project from schema",
      {
        output: {
          alias: "o",
          type: "string",
          description: "path to output directory",
          default: "app",
        },
        target: {
          alias: "t",
          type: "string",
          description: "target platform",
          default: "expo",
          choices: ["expo", "vite", "web-component"],
        },
        schema: {
          type: "string",
          demandOption: true,
        },
      },
      async (argv) => {
        const schema: AppSchema = JSON.parse(
          fs.readFileSync(path.resolve(process.cwd(), argv.schema), "utf8")
        );
        const output = path.resolve(process.cwd(), argv.output);
        await generateApp(schema, argv.target as "expo", output);
      }
    )
    .demandCommand(1)
    .help()
    .parse();
};

main(process.argv);
