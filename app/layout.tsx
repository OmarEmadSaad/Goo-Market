import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/layout/Providers";
import ThemeScript from "@/components/layout/ThemeScript";
import JsonLd from "@/components/seo/JsonLd";

import { getCategories, getProductGroups } from "@/lib/server/products";
import { getCurrentUser } from "@/lib/server/session";
import { getCartForUser } from "@/lib/server/cart";
import { EMPTY_CART } from "@/lib/server/cart";
import { organizationSchema, websiteSchema } from "@/lib/seo/jsonld";
import {
  SITE_DESCRIPTION,
  SITE_LANG,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Electronics, Home and Food Online`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: "/",
    title: `${SITE_NAME} - Electronics, Home and Food Online`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#03001C" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [groups, categories, user] = await Promise.all([
    getProductGroups(),
    getCategories(),
    getCurrentUser(),
  ]);

  const cart = user ? await getCartForUser(user.id) : EMPTY_CART;

  return (
    <html lang={SITE_LANG} className={inter.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <JsonLd schema={[organizationSchema(), websiteSchema()]} />

        <Providers initialCart={cart} isSignedIn={Boolean(user)}>
          <Header groups={groups} categories={categories} user={user} />

          <main id="main" className="flex-1">
            {children}
          </main>

          <Footer categories={categories} />
        </Providers>
      </body>
    </html>
  );
}
