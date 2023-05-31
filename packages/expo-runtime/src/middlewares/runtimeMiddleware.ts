import React from "react";
import { BaseBatiqCore } from "@batiq/core";
import { Element } from "@batiq/ir";
import { NavigationState } from "@react-navigation/native";
import { navigationRef } from "../Navigation";
import { deep_equal } from "@ctx-core/fast-deep-equal";
import { withComponentProvider } from "../ComponentProvider";

export type Runtime = {
  state: Record<string, any>;
  navigation: NavigationState | null;
  onStateChange: (key: string, state: any | ((prevState: any) => void)) => void;
  deleteState: (key: string) => void;
  addStateListener: (key: string, listener: () => void) => void;
  removeStateListener: (key: string, listener: () => void) => void;
  onNavigate: (state: NavigationState) => void;
  snapshot: () => null | {
    state: Runtime["state"];
    navigation: Runtime["navigation"];
  };
  resetState: (state: Runtime["state"]) => void;
  resetNavigation: (navigation: Runtime["navigation"]) => void;

  decorateComponent: <T = React.PropsWithChildren<any>>(
    component: React.ComponentType<T>,
    options: {
      index: number;
      element?: Element;
    }
  ) => React.ComponentType<T>;
  renderEmpty: () => React.ReactNode;
};

const runtime = <S extends BaseBatiqCore>(batiq: S): S & Runtime => {
  const stateListeners: Record<string, Set<() => void>> = {};
  const batiqRuntime: S & Runtime = {
    ...batiq,
    state: {},
    navigation: null,

    onStateChange: (key, state) => {
      let next = state;
      if (typeof state === "function") {
        next = state(batiqRuntime.state[key]);
      }
      batiqRuntime.state[key] = next;
      stateListeners[key]?.forEach((l) => l());
    },
    deleteState: (key) => {
      delete batiqRuntime.state[key];
      stateListeners[key]?.forEach((l) => l());
    },
    addStateListener: (key, listener) => {
      if (!stateListeners[key]) {
        stateListeners[key] = new Set();
      }
      stateListeners[key].add(listener);
    },
    removeStateListener: (key, listener) => {
      if (stateListeners[key]) {
        stateListeners[key].delete(listener);
      }
    },
    onNavigate: (state) => {
      batiqRuntime.navigation = state;
    },
    snapshot: () =>
      batiqRuntime.navigation === null
        ? null
        : {
            state: batiqRuntime.state,
            navigation: batiqRuntime.navigation,
          },
    resetState: (state) => {
      batiqRuntime.state = state;
      Object.values(stateListeners)
        .flatMap((listeners) => Array.from(listeners))
        .forEach((l) => l());
    },
    resetNavigation: (navigation) => {
      if (navigationRef.isReady() && navigation) {
        if (!deep_equal(batiqRuntime.navigation, navigation)) {
          batiqRuntime.navigation = navigation;
          navigationRef.reset(navigation);
        }
      }
    },

    decorateComponent: (component, { index, element }) =>
      withComponentProvider(index, component, element),
    renderEmpty: () => null,
  };

  return batiqRuntime;
};

export default runtime;
