import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider, type Theme, type ThemePreference } from "@/theme/theme";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themePref = cookieStore.get("aure-theme-preference")?.value;
  // Default to dark unless explicit light preference exists
  const isDark = themePref !== "light";
  const initialTheme: Theme = isDark ? "dark" : "light";
  const initialPreference: ThemePreference =
    themePref === "light" || themePref === "dark" || themePref === "system"
      ? (themePref as ThemePreference)
      : "dark";

  return (
    <html
      lang="en"
      className={`${inter.variable} ${isDark ? "dark" : ""} h-full antialiased`}
      style={{ colorScheme: isDark ? "dark" : "light" }}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Synchronous bootstrap script: executes in <head> before paint to eliminate any flash */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var p=localStorage.getItem('aure-theme-preference');var dark;if(p==='light'){dark=false;}else if(p==='dark'){dark=true;}else{dark=!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches);}var d=document.documentElement;if(dark){d.classList.add('dark');d.style.colorScheme='dark';document.cookie='aure-theme-preference=dark; path=/; max-age=31536000; SameSite=Lax';}else{d.classList.remove('dark');d.style.colorScheme='light';document.cookie='aure-theme-preference=light; path=/; max-age=31536000; SameSite=Lax';}}catch(e){}})();",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col text-foreground">
        <ThemeProvider initialPreference={initialPreference} initialTheme={initialTheme}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
