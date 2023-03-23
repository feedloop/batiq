import fs from "node:fs";
import path from "path";
import { spawn } from "node:child_process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { installApp, generateApp } from "@batiq/generator";
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

        fs.mkdirSync(output, { recursive: true });
        const cwd = process.cwd();
        try {
          process.chdir(output);
          await installApp(schema, argv.target as "expo");

          const childProcess = spawn(
            "npx",
            [
              "batiq",
              "generate-code",
              path.resolve(cwd, argv.schema),
              "--target",
              argv.target,
            ],
            {
              cwd: output,
            }
          );
          childProcess.stdout?.on("data", (data) => {
            console.log(data?.toString?.());
          });
          childProcess.stderr?.on("data", (data) => {
            console.error(data?.toString?.());
          });
          await new Promise((resolve) => {
            childProcess.on("close", resolve);
          });
        } catch (e) {
          process.chdir(cwd);
          throw e;
        } finally {
          process.chdir(cwd);
        }
      }
    )
    .command(
      "generate-code <schema>",
      false,
      {
        schema: {
          type: "string",
          description: "absolute path to schema file",
          hidden: true,
          demandOption: true,
        },
        target: {
          alias: "t",
          type: "string",
          description: "target platform",
          default: "expo",
          choices: ["expo", "vite", "web-component"],
        },
      },
      async (argv) => {
        const schema: AppSchema = JSON.parse(
          fs.readFileSync(argv.schema, "utf8")
        );
        await generateApp(schema, argv.target as "expo");
      }
    )
    .demandCommand(1)
    .help()
    .parse();
};

main(process.argv);
