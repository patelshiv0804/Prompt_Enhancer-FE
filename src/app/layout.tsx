import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/theme/theme";

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
      <body className="min-h-full flex flex-col text-foreground">
        {/* No-flash theme bootstrap. Runs synchronously before paint so a
            visitor loads straight into the correct theme with no white flash on
            any route. Resolves the same preference the ThemeProvider does:
            "light"/"dark" are used as-is; anything else (missing key or
            "system") follows the OS via prefers-color-scheme. Mirrors
            THEME_STORAGE_KEY in src/theme/theme.tsx. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var p=localStorage.getItem('aure-theme-preference');var dark;if(p==='light'){dark=false;}else if(p==='dark'){dark=true;}else{dark=!!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);}var d=document.documentElement;if(dark){d.classList.add('dark');d.style.colorScheme='dark';}else{d.classList.remove('dark');d.style.colorScheme='light';}}catch(e){}})();",
          }}
        />
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
