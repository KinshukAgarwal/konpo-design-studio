import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const grotesk = Inter({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Konpo — Full-Stack Design Studio",
  description: "Loader + hero reveal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${grotesk.variable} h-full`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
