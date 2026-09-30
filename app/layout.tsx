import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IoT-Based Fire Detection and Safety System",
  description: "Real-time ESP32 fire detection and safety monitoring dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}