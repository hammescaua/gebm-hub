import type { Metadata } from "next";
import "./globals.css";
// import AuthProvider from "./provider/AuthProvider";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "GEBM Hub",
  description: "Borges de Medeiros Student Council system built with Next.js 16 & React 19",
  keywords: ["student council", "school organization", "gebm"]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning className={cn("font-sans", geist.variable)}
    >
      <body className="min-h-screen bg-slate-950 text-slate">
        {/*<AuthProvider>*/}
        {children}
        {/*</AuthProvider>*/}
      </body>
    </html>
  );
}
