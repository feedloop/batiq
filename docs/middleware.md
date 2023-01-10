# Batiq Middleware

Batiq Middleware is a way to extend Batiq Core with custom functionality. It is a function that takes a Batiq instance and returns a new Batiq instance.

## Predefined middleware

### `loggerMiddleware`

This middleware logs all operations to the console.

```ts
import { loggerMiddleware } from "@batiq/core";

const app = createBatiq(appJson, [loggerMiddleware]);
```

### `multiplayerMiddleware`

This middleware allows you to sync the schema with other Batiq instances.

```ts
import { multiplayerMiddleware } from "@batiq/core";

const app = createBatiq(appJson, [multiplayerMiddleware]);
```

### `storageMiddleware`

This middleware saves the schema in the browser's local storage.

```ts
import { storageMiddleware } from "@batiq/core";

const app = createBatiq(appJson, [storageMiddleware]);
```

### `undoRedoMiddleware`

This middleware adds undo/redo functionality.

```ts
import { undoRedoMiddleware } from "@batiq/core";

const app = createBatiq(appJson, [undoRedoMiddleware]);
```

### `validationMiddleware`

This middleware validates the schema.

```ts
import { validationMiddleware } from "@batiq/core";

const app = createBatiq(appJson, [validationMiddleware]);
```

### `debugMiddleware`

This middleware logs the schema changes and the actions.

```ts
import { debugMiddleware } from "@batiq/core";

const app = createBatiq(appJson, [debugMiddleware]);
```

## Create a Middleware

To create a middleware, you need to create a function that takes a Batiq instance and returns a new Batiq instance.

```ts
import createBatiq from "@batiq/core";

const myMiddleware = (batiq) => (next) => (operation) => {
  if (operation.type === "insert") {
    // Do something
  }

  // Call the next middleware
  return next(operation);
};
```
