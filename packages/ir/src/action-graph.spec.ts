import { buildActionGraph } from "./action-graph";

describe("Action Graph", () => {
  it("should be able to create a graph", () => {
    const graph = buildActionGraph([
      {
        type: "action",
        from: "@batiq/actions",
        name: "action1",
        arguments: [],
        next: "action2",
      },
      {
        type: "action",
        from: "@batiq/actions",
        name: "action2",
        id: "action2",
        arguments: [],
        next: 2,
      },
      {
        type: "action",
        from: "@batiq/actions",
        name: "action3",
        id: "action3",
        arguments: [],
      },
    ]);
    expect(graph.nodes.length).toEqual(3);
    expect(graph.successEdges).toEqual([
      [0, 1],
      [1, 2],
    ]);
  });

  it("should be able to create a graph with error", () => {
    const graph = buildActionGraph([
      {
        type: "action",
        from: "@batiq/actions",
        name: "action1",
        arguments: [],
        next: "action2",
      },
      {
        type: "action",
        from: "@batiq/actions",
        name: "action2",
        id: "action2",
        arguments: [],
        next: 2,
        onError: "action3",
      },
      {
        type: "action",
        from: "@batiq/actions",
        name: "action3",
        id: "action3",
        arguments: [],
      },
    ]);
    expect(graph.nodes.length).toEqual(3);
    expect(graph.successEdges).toEqual([
      [0, 1],
      [1, 2],
    ]);
    expect(graph.errorEdges).toEqual([[1, 2]]);
  });

  it("should be able to create graph with loop", () => {
    const graph = buildActionGraph([
      {
        type: "action",
        from: "@batiq/actions",
        name: "action1",
        returns: ["result1"],
        id: "action1",
        arguments: [],
        next: "action2",
      },
      {
        type: "action",
        from: "@batiq/actions",
        name: "action2",
        id: "action2",
        arguments: [{ type: "expression", expression: "result1" }],
        next: "action3",
        onError: "action1",
      },
      {
        type: "action",
        from: "@batiq/actions",
        name: "action3",
        id: "action3",
        arguments: [],
      },
    ]);
    expect(graph.nodes.length).toEqual(3);
    expect(graph.successEdges).toEqual([
      [0, 1],
      [1, 2],
    ]);
    expect(graph.errorEdges).toEqual([[1, 0]]);
  });

  it("should be able to remove disconnected nodes", () => {
    const graph = buildActionGraph([
      {
        type: "action",
        from: "@batiq/actions",
        name: "action1",
        id: "action1",
        arguments: [],
        next: "action4",
      },
      {
        type: "action",
        from: "@batiq/actions",
        name: "action2",
        id: "action2",
        arguments: [],
        next: "action3",
        onError: "action1",
      },
      {
        type: "action",
        from: "@batiq/actions",
        name: "action3",
        id: "action3",
        onError: "action4",
        arguments: [],
      },
      {
        type: "action",
        from: "@batiq/actions",
        name: "action4",
        id: "action4",
        arguments: [],
      },
    ]);
    expect(graph.nodes.length).toEqual(2);
    expect(graph.successEdges).toEqual([[0, 1]]);
    expect(graph.errorEdges).toEqual([]);
  });
});
