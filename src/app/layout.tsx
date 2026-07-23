import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Algebraic Board",
  description: "Interactive algebraic board application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
