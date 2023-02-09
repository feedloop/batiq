import { useLinkTo, useNavigation } from "@react-navigation/native";

export const navigate = () => {
  const linkTo = useLinkTo();
  return (path: string) => linkTo(path);
};

export const goBack = () => {
  const navigation = useNavigation();
  return () => navigation.goBack();
};
