"use client";

import { Toaster } from "sileo";

export default function SileoToaster() {
  return (
    <Toaster
      position="top-center"
      options={{
        fill: "#171717",
        styles: {
          title: "text-white",
          description: "text-neutral-200",
          badge: "bg-white text-neutral-900",
          button: "!bg-white !text-neutral-900",
        },
      }}
    />
  );
}
