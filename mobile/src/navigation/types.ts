import type { RecognitionResponse } from "../api/types";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Result: { result: RecognitionResponse; photoUri: string };
};
