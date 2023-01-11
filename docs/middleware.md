# Batiq Middleware

Batiq Middleware is a way to extend Batiq Core with custom functionality. It is a function that takes a Batiq instance and returns a new Batiq instance.

## Predefined middleware

### `log`

This middleware logs all operations to the console.

```ts
import { log } from "@batiq/core/middleware";

const app = createBatiq(appJson, [log]);
```

### `multiplayer`

This middleware allows you to sync the schema with other Batiq instances.

```ts
import { multiplayer } from "@batiq/core/middleware";

const multiplayerMiddleware = multiplayer({
  url: "ws://localhost:3000",
  onConnect: () => console.log("Connected"),
  onDisconnect: () => console.log("Disconnected"),
});

const app = createBatiq(appJson, [multiplayerMiddleware]);
```

### `storage`

This middleware saves the schema in the browser's local storage.

```ts
import { storage } from "@batiq/core/middleware";

const storageMiddleware = storage({ key: "my-app" });

const app = createBatiq(appJson, [storageMiddleware]);
```

### `undoRedo`

This middleware adds undo/redo functionality.

```ts
import { undoRedo } from "@batiq/core/middleware";

const app = createBatiq(appJson, [undoRedo]);
```

### `validation`

This middleware validates the schema.

```ts
import { validation } from "@batiq/core/middleware";

const app = createBatiq(appJson, [validation]);
```

### `debug`

This middleware logs the schema changes and the actions.

```ts
import { debug } from "@batiq/core/middleware";

const app = createBatiq(appJson, [debug]);
```

## Create a Middleware

To create a middleware, you need to create a function that takes a Batiq instance and returns a new Batiq instance.

```ts
import createBatiq from "@batiq/core";
import { Middleware } from "@batiq/core/middleware";

const myMiddleware: Middleware = (batiq) => {
  return {
    ...batiq,
    dispatch: (operation) => {
      console.log(operation, batiq.getState());
      batiq.dispatch(operation);
    },
  };
};
```
