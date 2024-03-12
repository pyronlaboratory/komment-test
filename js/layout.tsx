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

/**
 * @description renders an HTML structure that includes various meta tags, links, and
 * scripts to provide a consistent user experience for Komment's software documentation.
 * 
 * @param { Readonly<{
 *   children: React.ReactElement;
 * }> } .children - React element to be rendered within the `RootLayout`.
 * 
 * @returns { HTML element. } an HTML document with a layout for Enterprise-Grade
 * Software Documentation.
 * 
 * 		- `html`: The root element of the HTML document, which contains all other elements.
 * 		- `head`: A child element of `html`, containing various metadata and links for
 * the document.
 * 		- `meta`: An array of meta tags, including `charSet`, `name`, `content`, and
 * `property` attributes.
 * 		- `link`: An array of link tags, including `rel`, `href`, and `as` attributes.
 * 		- `title`: The title element of the HTML document, which provides a brief
 * description of the page for search engines and browsers.
 * 		- `body`: The root element of the HTML body, which contains all other elements.
 * 		- `className`: A class attribute for the body element, set to a value determined
 * by the `inter` variable.
 * 		- `id`: An id attribute for the body element, set to a value determined by the
 * `inter` variable.
 * 		- `LayoutDefault`: A component returned by the `RootLayout` function, which is
 * used as the default layout for the body element.
 * 		- `GoogleTagManager`: A tag manager element, which sets up tracking and analytics
 * tags from Google.
 * 
 * 	Overall, the output of the `RootLayout` function appears to be a well-structured
 * and optimized HTML document, with various metadata and links included to provide
 * search engine optimization and accessibility features.
 */
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
