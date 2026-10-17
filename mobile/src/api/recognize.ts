import { File } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

const MAX_SIDE = 1280;
const JPEG_QUALITY = 0.85;

// Shrinks the photo (longest side at most MAX_SIDE) and re-encodes it as JPEG,
// so the upload stays small and fast on a mobile connection.
export async function prepareUpload(
  uri: string,
  width: number,
  height: number
): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  if (Math.max(width, height) > MAX_SIDE) {
    context.resize(width >= height ? { width: MAX_SIDE } : { height: MAX_SIDE });
  }
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY });
  return saved.uri;
}

export function buildUploadForm(uri: string): FormData {
  const form = new FormData();
  // Expo's fetch needs a real File object (a Blob) for multipart uploads.
  form.append("file", new File(uri));
  return form;
}