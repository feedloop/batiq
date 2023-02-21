export const importDefinition = async (source: string, name: string) => {
  const definitionPath =
    source + (source.endsWith("/") ? "" : "/") + "definitions.js";
  return (await import(definitionPath).catch(() => ({})))[name];
};
