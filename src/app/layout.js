import { Bricolage_Grotesque, Geom, Outfit } from "next/font/google";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import "@uploadthing/react/styles.css";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geom = Geom({
  variable: "--font-geom",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  fallback: ["Outfit", "sans-serif"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "FormFlow",
  description: "Dynamic multi-step forms built for modern workflows",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${bricolageGrotesque.variable} ${geom.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://utfs.io" />
      </head>
      <body className="min-h-full flex flex-col font-sans" style={{ fontFamily: 'var(--font-geom), var(--font-outfit), sans-serif' }}>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        {children}
      </body>
    </html>
  );
}


