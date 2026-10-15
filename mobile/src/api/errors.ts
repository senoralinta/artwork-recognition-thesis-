import type { Translations } from "../i18n/tr";
import { ApiError } from "./client";

export type ErrorContext = "login" | "register" | "generic";

// Maps an API error to a translated message for the user.
export function errorMessage(
  error: unknown,
  t: Translations,
  context: ErrorContext = "generic"
): string {
  if (!(error instanceof ApiError)) {
    return t.errors.generic;
  }
  if (error.status === 0) {
    return t.errors.network;
  }
  if (error.status === 401 && context === "login") {
    return t.errors.invalidCredentials;
  }
  if (
    error.status === 400 &&
    context === "register" &&
    error.detail.toLowerCase().includes("already")
  ) {
    return t.errors.emailTaken;
  }
  if (error.status === 400 || error.status === 422) {
    return t.errors.invalidInput;
  }
  if (error.status === 413) {
    return t.errors.tooLarge;
  }
  if (error.status >= 500) {
    return t.errors.server;
  }
  return t.errors.generic;
}
