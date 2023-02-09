import React from "react";
import { PageRuntimeLazy } from "./PageRuntime";
import schema from "./schema.json";

export default {
  title: "Runtime",
  component: PageRuntimeLazy,
  argTypes: {
    schema: { control: "object" },
  },
};

export const PageRuntime = (args) => <PageRuntimeLazy {...args} />;
PageRuntime.args = {
  schema: schema.pages[0],
};
