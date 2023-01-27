import { Button } from "native-base";
import { Type } from "@sinclair/typebox";

// @ts-ignore
Button.inputs = Type.Strict(Type.Object({}));

export { Button };
