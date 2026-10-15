export type User = {
  id?: number;
  name: string;
  email: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};
