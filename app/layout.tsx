import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Holly Take-home",
  description: "Holly Take-home",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased vsc-initialized">{children}</body>
    </html>
  );
}
