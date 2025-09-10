import LayoutShell from "@/components/LayoutShell";
import type { Metadata } from "next";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

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
            <LayoutShell>{children}</LayoutShell>
  );
}
