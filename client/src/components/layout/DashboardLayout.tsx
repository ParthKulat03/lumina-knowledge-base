import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="h-full w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
