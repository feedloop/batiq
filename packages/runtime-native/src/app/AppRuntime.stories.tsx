import { storiesOf } from "@storybook/react-native";
import React from "react";
import empty from "@batiq/runtime/src/empty.json";
import schema from "@batiq/runtime/src/schema.json";
import { NavigationRuntime } from "@batiq/runtime/src/AppRuntime.stories";

storiesOf("App Runtime", module).add("Navigation Runtime", () => {
  return <NavigationRuntime schema={schema} />;
});
