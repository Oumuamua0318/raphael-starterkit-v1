import Header from "@/components/header";
import { Footer } from "@/components/footer";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { createClient } from "@/utils/supabase/server";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Providers } from "./providers";
import "./globals.css";

const baseUrl = process.env.BASE_URL
  ? `https://${process.env.BASE_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: "AI 文章智能配图工具",
  description: "基于 GPT-5 语义分析和 FLUX.1 图像生成，为您的文章自动创建视觉风格一致的插图系列",
  keywords: "AI配图, 文章配图, 图像生成, AI插画, 智能配图",
  openGraph: {
    title: "AI 文章智能配图工具",
    description: "基于 GPT-5 语义分析和 FLUX.1 图像生成，为您的文章自动创建视觉风格一致的插图系列",
    type: "website",
    url: baseUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 文章智能配图工具",
    description: "基于 GPT-5 语义分析和 FLUX.1 图像生成，为您的文章自动创建视觉风格一致的插图系列",
  },
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="zh-CN" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <div className="relative min-h-screen">
              <Header user={user} />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
            <Sonner />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
