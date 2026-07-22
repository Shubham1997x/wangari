"use client";

const MAX_EDGE = 1280;
const TARGET_BYTES = 500 * 1024;
const QUALITY_STEPS = [0.8, 0.65, 0.5];

export async function compressToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unavailable");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let result: Blob | null = null;
  for (const quality of QUALITY_STEPS) {
    result = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality)
    );
    if (result && result.size <= TARGET_BYTES) return result;
  }
  if (!result) throw new Error("encode_failed");
  return result;
}

export async function uploadImage(file: File): Promise<string | null> {
  const blob = await compressToWebp(file);
  const formData = new FormData();
  formData.set("file", blob, "upload.webp");
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
  return data.ok && data.url ? data.url : null;
}
