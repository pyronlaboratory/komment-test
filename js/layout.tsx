import React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { GoogleTagManager } from "@next/third-parties/google";
import { Default as LayoutDefault } from "@/layout/Default";
import { Inter } from "next/font/google";
import "@/assets/scss/style.scss";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "Enterprise-Grade Software Documentation | Komment",
  description:
    "Komment automates software documentation with pipelines that plug into familiar developer workflows in your existing infrastructure. Get well-structured, sophisticated, reliable docs with zero reliance on third-parties.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactElement;
}>) {
  return (
    <html lang="en" className="sr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#151719" />
        <meta name="color-scheme" content="only light" />
        <meta
          property="og:description"
          content="Komment automates software documentation with pipelines that plug into familiar developer workflows in your existing infrastructure. Get well-structured, sophisticated, reliable docs with zero reliance on third-parties."
        />
        <meta
          property="og:image"
          content="https://www.komment.ai/static/komment_og.png"
        />

        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="logo192.png" />
        <link
          rel="preload"
          fetchPriority="high"
          href="/static/illustration-section-01.svg"
          as="image"
        />
        <link
          rel="manifest"
          href="/manifest.json"
          crossOrigin="use-credentials"
        />

        {/* Updated based on support link provide in the browser console.
        https://support.termly.io/en/articles/8952694-termly-cmp-embed-script-versions */}
        <Script
          type="text/javascript"
          src="https://app.termly.io/resource-blocker/d940c75a-90e5-470e-83db-4d4ad0e4cefc?autoBlock=on"
          strategy="beforeInteractive"
          async></Script>
        <title>Enterprise-Grade Software Documentation | Komment</title>
      </head>
      <body className={`${inter.className}`} id="root">
        <LayoutDefault>{children}</LayoutDefault>
      </body>
      <GoogleTagManager
        gtmId={process.env.NEXT_PUBLIC_GOOGLE_TAG_ID || ""}
        auth={process.env.NEXT_PUBLIC_GOOGLE_TAG_AUTH || ""}
        preview={process.env.NEXT_PUBLIC_GOOGLE_TAG_ENV || ""}
      />
    </html>
  );
}
