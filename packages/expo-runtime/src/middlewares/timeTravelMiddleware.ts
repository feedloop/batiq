import { BaseBatiqCore } from "@batiq/core";
import { Runtime } from "./runtimeMiddleware";

export type RuntimeState = NonNullable<ReturnType<Runtime["snapshot"]>>;

export type TimeTravel = {
  prevStack: RuntimeState[];
  nextStack: RuntimeState[];
  prevState: () => void;
  nextState: () => void;
  clearStateHistory: () => void;
};

const timeTravel = <S extends BaseBatiqCore & Runtime>(
  batiq: S
): S & TimeTravel => {
  const { dispatch, onStateChange, deleteState, onNavigate } = batiq;
  const snapshotPrevState = (batiqTimeTravel: S & TimeTravel) => {
    const snapshot = batiqTimeTravel.snapshot();
    if (snapshot) {
      batiqTimeTravel.prevStack.push(snapshot);
    }
  };
  const batiqTimeTravel: S & TimeTravel = {
    ...batiq,
    dispatch: (operations) => {
      // Clear stacks when schema changes
      batiqTimeTravel.clearStateHistory();
      dispatch(operations);
    },
    onStateChange: (key, state) => {
      snapshotPrevState(batiqTimeTravel);
      onStateChange(key, state);
    },
    deleteState: (key) => {
      snapshotPrevState(batiqTimeTravel);
      deleteState(key);
    },
    onNavigate: (state) => {
      snapshotPrevState(batiqTimeTravel);
      onNavigate(state);
    },

    prevStack: [],
    nextStack: [],
    prevState: () => {
      const prevState = batiqTimeTravel.prevStack.pop();
      const snapshot = batiqTimeTravel.snapshot();
      if (prevState && snapshot) {
        batiqTimeTravel.nextStack.push(snapshot);
        batiqTimeTravel.resetState(prevState.state);
        batiqTimeTravel.resetNavigation(prevState.navigation);
      }
    },
    nextState: () => {
      const nextState = batiqTimeTravel.nextStack.pop();
      const snapshot = batiqTimeTravel.snapshot();
      if (nextState && snapshot) {
        batiqTimeTravel.prevStack.push(snapshot);
        batiqTimeTravel.resetState(nextState.state);
        batiqTimeTravel.resetNavigation(nextState.navigation);
      }
    },
    clearStateHistory: () => {
      batiqTimeTravel.prevStack = [];
      batiqTimeTravel.nextStack = [];
    },
  };
  // @ts-ignore
  window.batiq = batiqTimeTravel;

  return batiqTimeTravel;
};

export default timeTravel;
