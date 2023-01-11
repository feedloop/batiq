# Batiq Middleware

Batiq Middleware is a way to extend Batiq Core with custom functionality. It is a function that takes a Batiq instance and returns a new Batiq instance.

## Predefined middleware

### `log`

This middleware logs all operations to the console.

```ts
import { log } from "@batiq/core/middleware";

const app = createBatiq(log(appJson));
```

### `multiplayer`

This middleware allows you to sync the schema with other Batiq instances.

```ts
import { multiplayer } from "@batiq/core/middleware";

const app = createBatiq(multiplayer(appJson));
```

### `storage`

This middleware saves the schema in the browser's local storage.

```ts
import { storage } from "@batiq/core/middleware";

const app = createBatiq(storage(appJson, { key: "batiq-schema" }));
```

### `undoRedo`

This middleware adds undo/redo functionality.

```ts
import { undoRedo } from "@batiq/core/middleware";

const app = createBatiq(undoRedo(appJson));
```

### `validation`

This middleware validates the schema.

```ts
import { validation } from "@batiq/core/middleware";

const app = createBatiq(validation(appJson));
```

### `debug`

This middleware logs the schema changes and the actions.

```ts
import { debug } from "@batiq/core/middleware";

const app = createBatiq(debug(appJson));
```

## Create a Middleware

To create a middleware, you need to create a function that takes a Batiq instance and returns a new Batiq instance.

Middleware definition:

```ts
type Middleware<Input extends Schema = Schema, Output extends Input = Input> = (
  input: Input
) => Output;
```

Import in your middleware:

```ts
import createBatiq from "@batiq/core";
import { Middleware } from "@batiq/core/middleware";

type MyMiddleware = {
  log: () => void;
}

const myMiddleware: Middleware<MyMiddleware> = (batiq: Batiq) => {
  if (operation.type === "insert") {
    // Do something
  }

  // Call the next middleware
  return next(operation);
};
```
