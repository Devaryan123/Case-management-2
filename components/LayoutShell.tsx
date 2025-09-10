"use client";
import DashboardLayout from "@/components/DashboardLayout";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // exact match; adjust if your route is different (e.g. '/auth/signin')
  if (pathname === "/signin") {
    // don't render Sidebar
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1">
        <div className="p-6">
          <DashboardLayout>{children}</DashboardLayout>
        </div>
      </main>
    </div>
  );
}
