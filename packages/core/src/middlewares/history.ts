import * as lens from "../lens";
import type { Path } from "../lens";
import { AppOperation, AppSchema, BaseBatiqCore } from "../types";

type ReversibleOperation =
  | { type: "insert"; path: Path<AppSchema>; value: any }
  | { type: "remove"; path: Path<AppSchema>; value: any }
  | { type: "set"; path: Path<AppSchema>; value: any; oldValue: any }
  | { type: "move"; from: Path<AppSchema>; to: Path<AppSchema> };

export type History = {
  undoStack: ReversibleOperation[][];
  redoStack: ReversibleOperation[][];
  canUndo: () => boolean;
  undo: () => void;
  canRedo: () => boolean;
  redo: () => void;
};

export const inverseOperation = (
  operation: ReversibleOperation
): ReversibleOperation => {
  switch (operation.type) {
    case "set":
      return {
        type: "set",
        path: operation.path,
        value: operation.oldValue,
        oldValue: operation.value,
      };

    case "remove":
      return {
        type: "insert",
        path: operation.path,
        value: operation.value,
      };

    case "insert":
      return {
        type: "remove",
        path: operation.path,
        value: operation.value,
      };

    case "move":
      return {
        type: "move",
        from: operation.to,
        to: operation.from,
      };
  }
};

const history = <S extends BaseBatiqCore>(batiq: S): S & History => {
  const { dispatch } = batiq;

  const transformAppOperation = (
    operation: AppOperation
  ): ReversibleOperation => {
    switch (operation.type) {
      case "set":
        return {
          type: "set",
          path: operation.path,
          value: operation.value,
          oldValue: lens
            .fromPath(batiq.export(), operation.path as any)
            .get(batiq.export()),
        };

      case "remove":
        return {
          type: "remove",
          path: operation.path,
          value: lens
            .fromPath(batiq.export(), operation.path as any)
            .get(batiq.export()),
        };

      default:
        return operation;
    }
  };

  const batiqHistory: S & History = {
    ...batiq,
    undoStack: [],
    redoStack: [],

    canUndo: () => batiqHistory.undoStack.length > 0,

    undo: () => {
      if (!batiqHistory.canUndo()) return;
      const operations = batiqHistory.undoStack.pop()!;
      batiqHistory.redoStack.push(operations.map(inverseOperation));
      dispatch(operations);
    },

    canRedo: () => batiqHistory.redoStack.length > 0,

    redo: () => {
      if (!batiqHistory.canRedo()) return;
      const operations = batiqHistory.redoStack.pop()!;
      batiqHistory.undoStack.push(operations.map(inverseOperation));
      dispatch(operations);
    },

    dispatch: (operations) => {
      batiqHistory.undoStack.push(
        operations.map(transformAppOperation).map(inverseOperation)
      );
      if (batiqHistory.canRedo()) {
        batiqHistory.redoStack = [];
      }
      dispatch(operations);
    },
  };

  return batiqHistory;
};

export default history;
