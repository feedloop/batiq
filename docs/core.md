# Batiq Core

Batiq Core is a library that provides a set of tools to build a Batiq application.

## Installation

```bash
# Using npm
npm install @batiq/core

# Using yarn
yarn add @batiq/core
```

## Usage

```ts
import createBatiq, { AppSchema } from "@batiq/core";

const appJson: AppSchema = {
  name: "My App",
  version: "1.0.0",
  description: "My App Description",
  pages: [
    {
      name: "Home",
      path: "/",
      component: {
        from: "@batiq/components",
        name: "Text",
        props: {
          title: "Home",
        },
      },
    },
  ],
};

const app = createBatiq(appJson);

app.addPage({
  name: "New Page",
  path: "/new-page",
  component: { ... },
});

app.subscribe((schema) => {
  // Do something with the new schema
});
```

## With React

```tsx
import { AppSchema } from "@batiq/core";
import createBatiq from "@batiq/core/react";

const appJson: AppSchema = {
  name: "My App",
  version: "1.0.0",
  description: "My App Description",
  pages: [ ... ],
};

const useBatiq = createBatiq(appJson);

// In your React component
import Runtime from "@batiq/runtime";
import { useBatiq } from "./batiq";

const App = () => {
  const schema = useBatiq();

  return (
    <div>
      <h1>{schema.name}</h1>
      <Runtime schema={schema} />
    </div>
  );
};
```

## Middleware

Batiq Core provides a middleware system to intercept the schema and modify it.

```ts
import createBatiq, { AppSchema, loggerMiddleware, multiplayerMiddleware } from "@batiq/core";
import { log, multiplier, undoRedo } from "@batiq/core/middleware";

const appJson: AppSchema = {
  name: "My App",
  version: "1.0.0",
  description: "My App Description",
  pages: [ ... ],
};

const app = createBatiq(log(multiplier(undoRedo(appJson))));
```

List of available middleware:

- [`log`](./middleware.md#loggermiddleware): Logs the schema changes.
- [`multiplayer`](./middleware.md#multiplayermiddleware): Allows multiple users to edit the schema at the same time.
- [`storage`](./middleware.md#storagemiddleware): Saves the schema in the browser's local storage.
- [`undoRedo`](./middleware.md#undoredomiddleware): Adds undo/redo functionality.
- [`validation`](./middleware.md#validationmiddleware): Validates the schema.
- [`debug`](./middleware.md#debugmiddleware): Logs the schema changes and the actions.

If you want to create your own middleware, see this [documentation](./middleware.md#create-a-middleware).
