import type { Metadata } from "next";
import "./globals.css";
import SileoToaster from "./toaster";

export const metadata: Metadata = {
  title: "CGIAR PDF Generator",
  description: "PDF template rendering service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <SileoToaster />
      </body>
    </html>
  );
}
