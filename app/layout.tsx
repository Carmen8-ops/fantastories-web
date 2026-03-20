import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FantaStories",
  description: "Gioca i tuoi momenti",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>

      <body className="antialiased">
          {children}
      </body>
    </html>
  );
}