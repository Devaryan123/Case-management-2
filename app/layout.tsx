import { StackProvider, StackTheme } from "@stackframe/stack";
import type { Metadata } from "next";
import { stackServerApp } from "../stack";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });
const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, []);

export const metadata: Metadata = {
  title: "Case Management",
  description: "Manage your legal cases efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <ConvexClientProvider>
            {children}
            </ConvexClientProvider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
