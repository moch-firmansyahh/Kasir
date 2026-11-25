import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/shared/ServiceWorkerRegister";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  fallback: ["system-ui", "sans-serif"],
});

const baloo2 = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  fallback: ["system-ui", "sans-serif"],
});

function getMetadataBase(): URL {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return new URL(siteUrl);
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) return new URL(`https://${vercelProd}`);
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return new URL(`https://${vercelUrl}`);
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "Cemal Cemul",
  description: "Aplikasi kasir dan layar dapur untuk Cemal Cemul",
  openGraph: {
    title: "Cemal Cemul",
    description: "Aplikasi kasir dan layar dapur untuk Cemal Cemul",
    siteName: "Cemal Cemul",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cemal Cemul",
    description: "Aplikasi kasir dan layar dapur untuk Cemal Cemul",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={cn(nunito.variable, baloo2.variable, "h-full antialiased")}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegister />
        <Toaster theme="light" position="top-center" richColors />
      </body>
    </html>
  );
}
