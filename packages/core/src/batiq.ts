import * as lens from "./lens";
import {
  AppOperation,
  AppSchema,
  BaseBatiqCore,
  CreateBatiqFn,
  Middleware,
} from "./types";

export const createBatiq: CreateBatiqFn = (
  json: AppSchema,
  middlewares: Middleware<BaseBatiqCore, BaseBatiqCore>[] = []
) => {
  const listeners = new Set<(operations: AppOperation[]) => void>();
  const batiq: BaseBatiqCore = {
    operations: [],

    dispatch: (operation) => {
      const operations = Array.isArray(operation) ? operation : [operation];
      batiq.operations = batiq.operations.concat(operations);

      const performOperation = (operation: AppOperation) => {
        switch (operation.type) {
          case "set": {
            json = lens
              .fromPath(json, operation.path as any)
              .set(json, operation.value as any);
            break;
          }

          case "remove": {
            json = lens.mod(
              json,
              operation.path.slice(0, -1) as any,
              (value: any) => {
                const lastKey = operation.path[operation.path.length - 1];
                if (Array.isArray(value)) {
                  return value.filter((_, i) => i !== lastKey);
                }
                const { [lastKey]: _, ...rest } = value;
                return rest;
              }
            );
            break;
          }

          case "insert": {
            const path = operation.path.slice(0, -1);
            const index = operation.path[operation.path.length - 1];
            json = lens.mod(json, path as any, (value: any): any =>
              Array.isArray(value) && typeof index === "number"
                ? [
                    ...value.slice(0, index),
                    operation.value,
                    ...value.slice(index),
                  ]
                : value
            );
            break;
          }

          case "move": {
            const value = lens.fromPath(json, operation.from as any).get(json);
            if (!value) return;
            performOperation({ type: "remove", path: operation.from });
            performOperation({
              type: "insert",
              path: operation.to,
              value,
            });
            break;
          }
        }
      };
      operations.forEach(performOperation);

      [...listeners].forEach((listener) => listener(operations));
    },

    getSchema: () => json,

    subscribe: (listener: (operations: AppOperation[]) => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  return middlewares.reduce(
    (instance, middleware) => middleware(instance),
    batiq
  );
};
