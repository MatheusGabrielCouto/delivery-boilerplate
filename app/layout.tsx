import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import "./globals.css";
import { QueryProvider } from "@/app/components/QueryProvider";
import { MenuHydrator } from "@/app/components/MenuHydrator";
import { MenuProvider } from "@/app/components/MenuProvider";
import { fetchMenu } from "@/app/lib/serverMenu";
import { fetchRewards } from "@/app/lib/serverApi";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();
  const [menu, rewards] = await Promise.all([fetchMenu(), fetchRewards()]);
  if (menu) queryClient.setQueryData(["menu"], menu);
  queryClient.setQueryData(["rewards"], rewards ?? []);
  const dehydratedState = dehydrate(queryClient);

  return (
    <html
      lang="pt-BR"
      className={`${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
          <MenuHydrator state={dehydratedState}>
            <MenuProvider>{children}</MenuProvider>
          </MenuHydrator>
        </QueryProvider>
      </body>
    </html>
  );
}
