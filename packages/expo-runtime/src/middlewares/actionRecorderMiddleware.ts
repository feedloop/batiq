import { AppSchema, BaseBatiqCore, ComponentSchema } from "@batiq/core";
import { NavigationState } from "@react-navigation/native";
import { Runtime } from "./runtimeMiddleware";
import { RuntimeState } from "./timeTravelMiddleware";

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

type Function = {
  type: "function";
  path: string;
  id: number;
};

type Navigation = {
  type: "navigation";
  state: NavigationState;
};

type Action = Function | Navigation;

export type ActionRecorder = {
  actions: Action[];
  record: () => void;
  stopRecording: () => [Action[], RuntimeState];
  play: (actions: Action[], state: RuntimeState) => void;
  subscribeAction: (path: string, id: number, callback: () => void) => void;
  unsubscribeAction: (path: string) => void;
  triggerAction: (path: string, id: number) => void;
  clearActions: () => void;
};

export const patchComponent = (component: ComponentSchema): ComponentSchema => {
  return {
    ...component,
    properties: Object.fromEntries(
      Object.entries(component.properties).map(([key, value]) => [
        key,
        !Array.isArray(value) && typeof value === "object"
          ? value.type === "component"
            ? patchComponent(value as ComponentSchema)
            : value.type === "action"
            ? // Patch action
              {
                type: "action",
                from: "@batiq/expo-runtime",
                name: "replayAction",
                arguments: [value],
              }
            : value
          : value,
      ])
    ),
    children: component.children.map((child) =>
      typeof child === "object" && child.type === "component"
        ? patchComponent(child)
        : child
    ),
  };
};

const actionRecorder = <S extends BaseBatiqCore & Runtime & ActionRecorder>(
  batiq: S
): S & ActionRecorder => {
  const { dispatch, onNavigate } = batiq;
  let isRecording = false;
  let tmpSchema: AppSchema["pages"] | undefined;
  let initialState: RuntimeState | undefined;
  const patchAction = () => {
    tmpSchema = batiq.getSchema().pages;
    dispatch({
      type: "set",
      path: ["pages"],
      value: tmpSchema.map((page) => ({
        ...page,
        children: page.children.map((child) =>
          typeof child === "object" && child.type === "component"
            ? patchComponent(child)
            : child
        ),
      })),
    });
  };
  const subscribedActions = new Map<string, Map<number, () => void>>();
  const batiqActionRecorder: S & ActionRecorder = {
    ...batiq,
    actions: [],
    dispatch: (operations) => {
      if (isRecording) {
        batiqActionRecorder.clearActions();
      }
      dispatch(operations);
    },
    onNavigate: (state) => {
      if (isRecording) {
        batiqActionRecorder.actions.push({ type: "navigation", state });
      }
      onNavigate(state);
    },
    record: () => {
      const state = batiqActionRecorder.snapshot();
      if (state) {
        initialState = state;
      }
      patchAction();
      isRecording = true;
    },
    stopRecording: () => {
      const actions = batiqActionRecorder.actions.slice();
      batiqActionRecorder.clearActions();
      return [actions, initialState];
    },
    play: (actions, state) => {
      if (!state.navigation) {
        throw new Error("State must have navigation");
      }
      patchAction();
      batiqActionRecorder.resetState(state.state);
      batiqActionRecorder.resetNavigation(state.navigation);
      const actionSequence = actions.reduce(
        (p: Promise<void>, action, i): Promise<void> => {
          const nextAction = () => {
            switch (action.type) {
              case "function":
                return subscribedActions.get(action.path)?.get(action.id)?.();

              case "navigation":
                return batiqActionRecorder.resetNavigation(action.state);
            }
          };
          return p
            .then(nextAction)
            .then(() => wait(i === actions.length - 1 ? 0 : 1000));
        },
        Promise.resolve() as Promise<void>
      );
      actionSequence.then(() => {
        batiqActionRecorder.clearActions();
      });
    },
    subscribeAction: (path, id, callback) => {
      if (!subscribedActions.has(path)) {
        subscribedActions.set(path, new Map());
      }
      subscribedActions.get(path)?.set(id, callback);
    },
    unsubscribeAction: (path) => {
      subscribedActions.delete(path);
    },
    triggerAction: (path, id) => {
      batiqActionRecorder.actions.push({ type: "function", path, id });
      subscribedActions.get(path)?.get(id)?.();
    },
    clearActions: () => {
      isRecording = false;
      batiqActionRecorder.actions = [];
      batiqActionRecorder.dispatch({
        type: "set",
        path: ["pages"],
        value: tmpSchema,
      });
    },
  };
  // @ts-ignore
  window.batiq = batiqActionRecorder;

  return batiqActionRecorder;
};

export default actionRecorder;
