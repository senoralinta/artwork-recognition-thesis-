import type { RecognitionResponse } from "../api/types";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Result: { result: RecognitionResponse; photoUri: string };
  ArtworkDetail: { artworkId: number };
};

export type MainTabParamList = {
  Discover: undefined;
  Identify: undefined;
  History: undefined;
  Profile: undefined;
};
