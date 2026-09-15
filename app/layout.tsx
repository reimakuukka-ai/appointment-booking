import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { config } from "@/lib/config";

// Fontti — voit vaihtaa toiseen Google Fontiin
// Ks. https://nextjs.org/docs/app/building-your-application/optimizing/fonts
const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: config.siteTitle,
  description: config.siteDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { brand, brandDark, brandLight, brandMid } = config.brandShades;

  return (
    <html
      lang="fi"
      className={`${ibmPlexSans.variable} h-full antialiased`}
      style={{
        '--color-brand': brand,
        '--color-brand-dark': brandDark,
        '--color-brand-light': brandLight,
        '--color-brand-mid': brandMid,
      } as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
