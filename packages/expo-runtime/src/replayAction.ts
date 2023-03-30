import React from "react";
import { BaseBatiqCore } from "@batiq/core";
import { ActionRecorder } from "./middlewares/actionRecorderMiddleware";
import { useBatiq } from "./AppContext";
import { useId } from "./PathProvider";

export const replayAction = () => {
  const batiq = useBatiq<BaseBatiqCore & ActionRecorder>();
  const path = useId();
  let counter = 0;

  React.useEffect(() => {
    return () => {
      batiq.unsubscribeAction(path);
    };
  }, [batiq, path]);

  return (action: () => void) => {
    const id = counter++;
    batiq.subscribeAction(path, id, action);
    return () => {
      batiq.triggerAction(path, id);
    };
  };
};
