import React from "react";
import { NavigationRuntimeLazy } from "./NavigationRuntime";
import schema from "./schema.json";

export default {
  title: "Navigation Runtime",
  parameters: {
    layout: "fullscreen",
  },
  component: NavigationRuntimeLazy,
  argTypes: {
    schema: { control: "object" },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const NavigationRuntime = (args) => <NavigationRuntimeLazy {...args} />;
NavigationRuntime.args = {
  schema: schema,
};
