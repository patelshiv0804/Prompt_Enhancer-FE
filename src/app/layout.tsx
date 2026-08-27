import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AURE — Write Better Prompts, Get Better Answers",
  description:
    "AURE helps you write better prompts so AI can give you better answers. Optimize for ChatGPT, Claude, Gemini, Midjourney, and more.",
  keywords: [
    "AURE",
    "prompt engineering",
    "AI prompts",
    "ChatGPT",
    "Claude",
    "prompt optimizer",
  ],
  icons: {
    icon: "/logo_1.svg",
    shortcut: "/logo_1.svg",
    apple: "/logo_1.svg",
  },
  openGraph: {
    title: "AURE — Write Better Prompts, Get Better Answers",
    description:
      "AURE helps you write better prompts so AI can give you better answers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white text-foreground">
        {/* No-flash theme bootstrap. Runs synchronously before paint so a
            returning dark-mode visitor never sees a white flash. Scoped to the
            landing ("/") and auth ("/auth") routes. Mirrors
            THEME_STORAGE_KEY in src/theme/theme.tsx. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var p=location.pathname;if(p==='/'||p==='/auth'||p==='/auth/'){var t=localStorage.getItem('aure-theme');if(t==='dark'){var d=document.documentElement;d.classList.add('dark');d.style.colorScheme='dark';}}}catch(e){}})();",
          }}
        />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
