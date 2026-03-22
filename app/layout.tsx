import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/app/components/QueryProvider";
import { MenuProvider } from "@/app/components/MenuProvider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Cardápio Online",
    template: "%s | Cardápio Online",
  },
  description: "Peça online e receba em casa",
  openGraph: {
    title: "Cardápio Online",
    description: "Peça online e receba em casa",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cardápio Online",
    description: "Peça online e receba em casa",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
          <MenuProvider>{children}</MenuProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
