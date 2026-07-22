"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-paper group-[.toaster]:text-ink group-[.toaster]:border-hairline group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-ink-soft",
          actionButton: "group-[.toast]:bg-ultra group-[.toast]:text-paper",
          cancelButton: "group-[.toast]:bg-tint group-[.toast]:text-ink",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
