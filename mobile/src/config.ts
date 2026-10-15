// Base URL of the backend API, read from mobile/.env.local (EXPO_PUBLIC_API_URL).
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

if (!API_URL) {
  console.warn("EXPO_PUBLIC_API_URL is not set. Create mobile/.env.local and restart Expo.");
}
