import { readFile } from "fs/promises";
import path from "path";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

// Serves runtime-uploaded images. Static files in public/uploads take priority
// over this route, so seed images are unaffected; anything not in the build's
// public snapshot (i.e. admin uploads) is read from disk here.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!/^[\w.-]+$/.test(filename) || filename.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[extension];
  if (!contentType) {
    return new Response("Not found", { status: 404 });
  }

  const candidates = [
    path.join(process.cwd(), "uploads", filename),
    // legacy location: files uploaded before uploads/ existed
    path.join(process.cwd(), "public", "uploads", filename),
  ];

  for (const filePath of candidates) {
    try {
      const buffer = await readFile(filePath);
      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type": contentType,
          // filenames are random UUIDs, so content never changes for a given URL
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // try next location
    }
  }

  return new Response("Not found", { status: 404 });
}
