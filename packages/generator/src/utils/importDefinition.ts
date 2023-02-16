import path from "node:path";

export const importDefinition = async (source: string, name: string) => {
  const definitionPath = path.join(source, "definitions.js");
  return (
    await import(
      source.startsWith("./") ? `./${definitionPath}` : definitionPath
    ).catch(() => ({}))
  )[name];
};
