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
    <html lang="en" className={`${inter.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-white text-foreground">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
