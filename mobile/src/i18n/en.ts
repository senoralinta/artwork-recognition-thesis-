import type { Translations } from "./tr";

export const en: Translations = {
  appName: "Artwork Recognition",
  auth: {
    loginTitle: "Log In",
    registerTitle: "Create Account",
    name: "Full name",
    email: "Email",
    password: "Password",
    loginButton: "Log In",
    registerButton: "Sign Up",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    fillAll: "Please fill in all fields.",
  },
  errors: {
    network: "Could not reach the server. Check your connection and that the server is running.",
    invalidCredentials: "Incorrect email or password.",
    emailTaken: "An account with this email already exists.",
    invalidInput: "The information you entered is not valid. Check the email and password length.",
    tooLarge: "The photo is too large.",
    server: "A server error occurred. Please try again later.",
    generic: "Something went wrong. Please try again.",
  },
  home: {
    hello: (name: string) => `Hello, ${name}`,
    serverStatus: "Server connection",
    serverOk: "Running",
    serverFail: "Unreachable",
    checkAgain: "Check again",
    logout: "Log Out",
  },
};
