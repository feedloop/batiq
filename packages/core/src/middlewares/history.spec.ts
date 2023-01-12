import { createBatiq } from "../batiq";
import history from "./history";

const initialSchema = {
  name: "app",
  pages: [
    {
      name: "page 1",
      path: "/page-1",
    },
    {
      name: "page 2",
      path: "/page-2",
    },
  ],
};

describe("Reverse Operation", () => {
  it("should be able to reverse an insert operation", () => {
    const batiq = history(createBatiq(initialSchema));

    batiq.dispatch([
      {
        type: "insert",
        path: ["pages", 2],
        value: {
          name: "page 4",
          path: "/page-4",
        },
      },
    ]);

    batiq.undo();
    expect(batiq.export()).toEqual(initialSchema);

    batiq.redo();
    expect(batiq.export()).toEqual({
      ...initialSchema,
      pages: [
        ...initialSchema.pages,
        {
          name: "page 4",
          path: "/page-4",
        },
      ],
    });
  });

  it("should be able to reverse a remove operation", () => {
    const batiq = history(createBatiq(initialSchema));

    batiq.dispatch([
      {
        type: "remove",
        path: ["pages", 1],
      },
    ]);

    batiq.undo();
    expect(batiq.export()).toEqual(initialSchema);

    batiq.redo();
    expect(batiq.export()).toEqual({
      ...initialSchema,
      pages: [initialSchema.pages[0]],
    });
  });

  it("should be able to reverse a set operation", () => {
    const batiq = history(createBatiq(initialSchema));

    batiq.dispatch([
      {
        type: "set",
        path: ["pages", 1, "name"],
        value: "page 3",
      },
    ]);

    batiq.undo();
    expect(batiq.export()).toEqual(initialSchema);

    batiq.redo();
    expect(batiq.export()).toEqual({
      ...initialSchema,
      pages: initialSchema.pages.map((page, index) =>
        index === 1 ? { ...page, name: "page 3" } : page
      ),
    });
  });

  it("should be able to reverse a move operation", () => {
    const batiq = history(createBatiq(initialSchema));

    batiq.dispatch([
      {
        type: "move",
        from: ["pages", 0],
        to: ["pages", 1],
      },
    ]);

    batiq.undo();
    expect(batiq.export()).toEqual(initialSchema);

    batiq.redo();
    expect(batiq.export()).toEqual({
      ...initialSchema,
      pages: [initialSchema.pages[1], initialSchema.pages[0]],
    });
  });
});

describe("History Stack", () => {
  it("should increase undo stack when dispatching an operation", () => {
    const batiq = history(createBatiq(initialSchema));

    batiq.dispatch([
      {
        type: "set",
        path: ["pages", 1, "name"],
        value: "page 3",
      },
    ]);

    expect(batiq.undoStack.length).toBe(1);
  });

  it("should increase redo stack when undoing an operation", () => {
    const batiq = history(createBatiq(initialSchema));

    batiq.dispatch([
      {
        type: "set",
        path: ["pages", 1, "name"],
        value: "page 3",
      },
    ]);
    batiq.dispatch([
      {
        type: "set",
        path: ["pages", 1, "name"],
        value: "page 4",
      },
    ]);
    batiq.undo();
    batiq.redo();
    batiq.undo();

    expect(batiq.undoStack.length).toBe(1);
    expect(batiq.redoStack.length).toBe(1);
  });

  it("should clear redo stack when dispatching a new operation", () => {
    const batiq = history(createBatiq(initialSchema));

    batiq.dispatch([
      {
        type: "set",
        path: ["pages", 1, "name"],
        value: "page 3",
      },
    ]);
    batiq.dispatch([
      {
        type: "set",
        path: ["pages", 1, "name"],
        value: "page 4",
      },
    ]);
    batiq.undo();
    batiq.dispatch([
      {
        type: "set",
        path: ["pages", 1, "name"],
        value: "page 5",
      },
    ]);

    expect(batiq.undoStack.length).toBe(2);
    expect(batiq.redoStack.length).toBe(0);
  });

  it("should not do anything when undoing/redoing an empty stack", () => {
    // const batiq = history(createBatiq(initialSchema));
    const batiq = createBatiq(initialSchema, [history]);

    batiq.dispatch([
      {
        type: "set",
        path: ["pages", 1, "name"],
        value: "page 3",
      },
    ]);
    batiq.undo();
    batiq.undo();

    expect(batiq.export()).toEqual(initialSchema);

    batiq.redo();
    batiq.redo();
    expect(batiq.export()).toEqual({
      ...initialSchema,
      pages: initialSchema.pages.map((page, index) =>
        index === 1 ? { ...page, name: "page 3" } : page
      ),
    });
  });
});
