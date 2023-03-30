import {
  AppProvider,
  runtimeMiddleware,
  timeTravelMiddleware,
  actionRecorderMiddleware,
} from "@batiq/expo-runtime";
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

export const NavigationRuntime = (props) => {
  return (
    <AppProvider
      schema={props.schema}
      middlewares={[
        runtimeMiddleware,
        // @ts-ignore
        timeTravelMiddleware,
        // @ts-ignore
        actionRecorderMiddleware,
      ]}
    >
      <NavigationRuntimeLazy scope={props.scope} />
    </AppProvider>
  );
};
NavigationRuntime.args = {
  schema: schema,
};
