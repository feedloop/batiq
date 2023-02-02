import { Button as NativeButton, IButtonProps } from "native-base";
import { Type } from "@sinclair/typebox";
import { useLinkTo } from "@react-navigation/native";

const ButtonLink = (props: IButtonProps & { to: string }) => {
  const { to, ...rest } = props;
  const linkTo = useLinkTo();
  return (
    <NativeButton
      // @ts-ignore
      onPress={() => linkTo(to)}
      {...rest}
    />
  );
};

const Button = (props: IButtonProps & { to: string }) => {
  const { to, ...rest } = props;
  return to ? <ButtonLink to={to} {...rest} /> : <NativeButton {...rest} />;
};

// @ts-ignore
Button.inputs = Type.Strict(Type.Object({}));

export { Button };
