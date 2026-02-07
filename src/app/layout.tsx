import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlogDidacta – Gemeinsam bloggen. Echt veröffentlichen.",
  description:
    "Die Plattform, mit der Schüler:innen gemeinsam Blogeinträge verfassen und mit einem Klick im Internet veröffentlichen.",
  keywords: ["Blog", "Schule", "Unterricht", "Kollaboration", "Bildung"],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="antialiased">
      <body className="min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
