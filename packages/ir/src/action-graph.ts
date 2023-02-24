import {
  ActionSchema,
  Container,
  ExpressionSchema,
  Primitive,
} from "@batiq/core";

type ActionNode = {
  type: "node";
  from: string;
  name: string;
  arguments: Container<Primitive | ExpressionSchema>[];
};

type ActionEdge = [number, number];

type ActionGraph<Node = ActionNode> = {
  nodes: Node[];
  successEdges: ActionEdge[];
  errorEdges: ActionEdge[];
};

const buildActionGraph_ = (
  actions: ActionSchema[],
  currentIndex: number,
  graph: ActionGraph<ActionNode & { id: number }>
): ActionGraph<ActionNode & { id: number }> => {
  if (graph.nodes.some((n) => n.id === currentIndex)) {
    return graph;
  }
  const action = actions[currentIndex];
  const actionNode: ActionNode & { id: number } = {
    type: "node",
    id: currentIndex,
    from: action.from,
    name: action.name,
    arguments: action.arguments,
  };
  graph = {
    ...graph,
    nodes: [...graph.nodes, actionNode],
  };

  const nextIndex =
    typeof action.next === "number"
      ? action.next
      : actions.findIndex(
          (a) => action.next !== undefined && a.id === action.next
        );
  if (nextIndex >= 0) {
    graph = buildActionGraph_(actions, nextIndex, {
      ...graph,
      successEdges: [...graph.successEdges, [actionNode.id, nextIndex]],
    });
  }
  const errorIndex =
    typeof action.onError === "number"
      ? action.onError
      : actions.findIndex(
          (a) => action.onError !== undefined && a.id === action.onError
        );
  if (errorIndex >= 0) {
    graph = buildActionGraph_(actions, errorIndex, {
      ...graph,
      errorEdges: [...graph.errorEdges, [actionNode.id, errorIndex]],
    });
  }
  return graph;
};

export const buildActionGraph = (actions: ActionSchema[]): ActionGraph => {
  const graph = buildActionGraph_(actions, 0, {
    nodes: [],
    successEdges: [],
    errorEdges: [],
  });

  // normalize edges to use node index instead of id for easier lookup
  const nodeMap = Object.fromEntries(graph.nodes.map((n, i) => [n.id, i]));
  return {
    ...graph,
    successEdges: graph.successEdges.map(([from, to]) => [
      nodeMap[from],
      nodeMap[to],
    ]),
    errorEdges: graph.errorEdges.map(([from, to]) => [
      nodeMap[from],
      nodeMap[to],
    ]),
  };
};
