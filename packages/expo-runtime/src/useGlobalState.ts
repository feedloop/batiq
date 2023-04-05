import React from "react";
import { useBatiq } from "./AppContext";
import { BaseBatiqCore } from "@batiq/core";
import { Runtime } from "./middlewares/runtimeMiddleware";

export const useGlobalState = (key: string, initialValue: any) => {
  const batiq = useBatiq<BaseBatiqCore & Runtime>();
  const subscribe = React.useCallback(
    (listener) => {
      batiq.addStateListener(key, listener);

      return () => batiq.removeStateListener(key, listener);
    },
    [batiq, key]
  );
  const state = React.useSyncExternalStore(
    subscribe,
    () => batiq.state[key] || initialValue
  );
  const setState = React.useCallback(
    (stateOrSetter: any | ((state: any) => void)) => {
      batiq.onStateChange(key, stateOrSetter);
    },
    []
  );
  const deleteState = React.useCallback((key: string) => {
    batiq.deleteState(key);
  }, []);
  React.useEffect(() => {
    if (!batiq.state[key] && initialValue) {
      batiq.state[key] = initialValue;
    }
  }, []);
  return [state, setState, deleteState];
};
