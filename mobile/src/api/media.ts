import { API_URL } from "../config";

// Artwork images are served by the backend as static files.
export function mediaUrl(path: string): string {
  return `${API_URL}${path}`;
}

// Painting shown on the sign-in screens (a Met object id that is part of the reference set).
export const SIGN_IN_ARTWORK_URL = mediaUrl("/static/artworks/437881.jpg");
