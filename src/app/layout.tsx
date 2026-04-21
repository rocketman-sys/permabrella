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
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
