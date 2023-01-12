import { createBatiq } from "./batiq";

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

describe("Batiq", () => {
  it("should be able to create a batiq instance", () => {
    const batiq = createBatiq(initialSchema);

    expect(batiq.getSchema()).toEqual(initialSchema);
  });

  it('should call subscribers when "dispatch" is called', () => {
    const batiq = createBatiq(initialSchema);
    const subscriber = jest.fn();
    batiq.subscribe(subscriber);

    batiq.dispatch({
      type: "set",
      path: ["name"],
      value: "new app",
    });

    expect(subscriber).toHaveBeenCalledWith([
      {
        type: "set",
        path: ["name"],
        value: "new app",
      },
    ]);
  });

  it("should not call subscriber when subscriber stops listening", () => {
    const batiq = createBatiq(initialSchema);
    const subscriber = jest.fn();
    const unsubscribe = batiq.subscribe(subscriber);
    unsubscribe();

    batiq.dispatch({
      type: "set",
      path: ["name"],
      value: "new app",
    });

    expect(subscriber).not.toHaveBeenCalled();
  });
});

describe("Batiq Operations", () => {
  it("should be able to insert a value", () => {
    const batiq = createBatiq(initialSchema);

    batiq.dispatch([
      {
        type: "insert",
        path: ["pages", 2],
        value: {
          name: "page 4",
          path: "/page-4",
        },
      },
      {
        type: "insert",
        path: ["pages", 2],
        value: {
          name: "page 3",
          path: "/page-3",
        },
      },
    ]);

    expect(batiq.getSchema()).toEqual({
      ...initialSchema,
      pages: [
        ...initialSchema.pages,
        {
          name: "page 3",
          path: "/page-3",
        },
        {
          name: "page 4",
          path: "/page-4",
        },
      ],
    });
  });

  it("should be able to remove a value", () => {
    const batiq = createBatiq(initialSchema);

    batiq.dispatch({
      type: "remove",
      path: ["pages", 0],
    });

    expect(batiq.getSchema()).toEqual({
      ...initialSchema,
      pages: initialSchema.pages.slice(1),
    });
  });

  it("should be able to set a value", () => {
    const batiq = createBatiq(initialSchema);

    batiq.dispatch({
      type: "set",
      path: ["pages", 0, "name"],
      value: "page 1 updated",
    });

    expect(batiq.getSchema()).toEqual({
      ...initialSchema,
      pages: [
        {
          ...initialSchema.pages[0],
          name: "page 1 updated",
        },
        ...initialSchema.pages.slice(1),
      ],
    });
  });

  it("should be able to move a value", () => {
    const batiq = createBatiq(initialSchema);

    batiq.dispatch({
      type: "move",
      from: ["pages", 0],
      to: ["pages", 1],
    });

    expect(batiq.getSchema()).toEqual({
      ...initialSchema,
      pages: initialSchema.pages.slice().reverse(),
    });
  });
});
