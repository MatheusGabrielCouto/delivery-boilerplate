import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { ImagePreloader } from "@/app/components/ImagePreloader";
import menuData from "@/data/products.json";
import type { MenuData } from "@/app/types";

const data = menuData as MenuData;
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${data.restaurant.name} - Cardápio Online`,
    template: `%s | ${data.restaurant.name}`,
  },
  description: data.restaurant.description || "Peça online e receba em casa",
  openGraph: {
    title: `${data.restaurant.name} - Cardápio Online`,
    description: data.restaurant.description || "Peça online e receba em casa",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: `${data.restaurant.name} - Cardápio Online`,
    description: data.restaurant.description || "Peça online e receba em casa",
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: data.restaurant.name,
    description: data.restaurant.description,
    ...(data.restaurant.icon && { image: data.restaurant.icon }),
    servesCuisine: "Brazilian",
  };

  return (
    <html
      lang="pt-BR"
      className={`${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider theme={data.theme}>
          <ImagePreloader>{children}</ImagePreloader>
        </ThemeProvider>
      </body>
    </html>
  );
}
