import type { Metadata } from "next";
import { Inter_Tight, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import { AppProviders } from "@/components/providers/AppProviders";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SITE_ORIGIN } from "@/lib/site";

const fontDisplay = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700"],
});

const fontBody = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const shareImage = {
  url: "/brand/share-permabrella-v1.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "PermaBrella umbrella and growing plant logo on a cream background",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "PermaBrella — Northern Rivers permaculture hub",
  description:
    "An umbrella platform connecting all things permaculture, food security, and community resilience in our local region.",
  icons: {
    icon: "/brand/logo-permabrella.svg",
    shortcut: "/brand/logo-permabrella.svg",
    apple: "/brand/logo-permabrella.svg",
  },
  openGraph: {
    siteName: "PermaBrella",
    title: "PermaBrella — Northern Rivers permaculture hub",
    description:
      "An umbrella platform connecting all things permaculture, food security, and community resilience in our local region.",
    url: SITE_ORIGIN,
    locale: "en_AU",
    type: "website",
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    images: [shareImage],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en-AU"
      className={`${fontDisplay.variable} ${fontBody.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AppProviders session={session}>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:p-3">Skip to content</a>
          <Navbar />
          <main id="main-content" className="relative flex-1">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
