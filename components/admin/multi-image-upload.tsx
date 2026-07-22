"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import { uploadImage } from "./image-upload";

const MAX_IMAGES = 12;

export function MultiImageUpload({
  images,
  featured,
  onChange,
}: {
  images: string[];
  featured: string;
  onChange: (images: string[], featured: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: File[]) => {
    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      toast.error(`Up to ${MAX_IMAGES} images per product.`);
      return;
    }
    if (files.length > room) {
      toast.error(`Only ${room} more image${room === 1 ? "" : "s"} can be added.`);
      files = files.slice(0, room);
    }
    setUploading(true);
    let next = images;
    let nextFeatured = featured;
    try {
      for (const file of files) {
        try {
          const url = await uploadImage(file);
          if (!url) {
            toast.error(`${file.name}: too large even after compression.`);
            continue;
          }
          next = [...next, url];
          if (!nextFeatured) nextFeatured = url;
          onChange(next, nextFeatured);
        } catch {
          toast.error(`${file.name}: could not process. Try a JPG or PNG.`);
        }
      }
      const added = next.length - images.length;
      if (added > 0) toast.success(`${added} image${added === 1 ? "" : "s"} uploaded.`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (url: string) => {
    const next = images.filter((u) => u !== url);
    onChange(next, featured === url ? (next[0] ?? "") : featured);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((url) => {
          const isFeatured = url === featured;
          return (
            <div
              key={url}
              className={`group/thumb relative aspect-square overflow-hidden rounded-lg bg-tint ${
                isFeatured ? "border-2 border-ultra" : "border border-hairline"
              }`}
            >
              <img src={url} alt="Product" className="h-full w-full object-cover" />
              {isFeatured && (
                <span className="absolute left-1.5 top-1.5 rounded-md bg-ultra px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-paper">
                  Featured
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(url)}
                aria-label="Remove image"
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-ink/70 text-paper opacity-0 transition-opacity hover:bg-ink focus-visible:opacity-100 group-hover/thumb:opacity-100"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
              {!isFeatured && (
                <button
                  type="button"
                  onClick={() => onChange(images, url)}
                  className="absolute inset-x-0 bottom-0 bg-ink/70 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-paper opacity-0 transition-opacity hover:bg-ultra focus-visible:opacity-100 group-hover/thumb:opacity-100"
                >
                  Set featured
                </button>
              )}
            </div>
          );
        })}
        {images.length < MAX_IMAGES && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-hairline text-ink-soft transition-colors hover:border-ultra hover:text-ultra disabled:opacity-60"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
              {uploading ? "Uploading..." : "Add images"}
            </span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) void handleFiles(files);
        }}
      />
      <p className="mt-2 text-xs leading-relaxed text-ink-soft">
        Any photos work — they are resized and compressed automatically. The featured image is the
        one shown on the catalog card.
      </p>
    </div>
  );
}
