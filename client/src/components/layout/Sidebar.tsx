import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  FileText, 
  Settings, 
  Database, 
  Cpu,
  LogOut
} from "lucide-react";
import Logo from "@assets/generated_images/minimalist_neural_network_logo.png";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { icon: Search, label: "Search Knowledge", href: "/" },
    { icon: FileText, label: "Documents", href: "/documents" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="h-screen w-64 border-r bg-sidebar flex flex-col text-sidebar-foreground">
      <div className="p-6 flex items-center gap-3">
        <img src={Logo} alt="Lumina" className="w-8 h-8 object-contain" />
        <span className="font-bold text-lg tracking-tight">Lumina</span>
      </div>

      <div className="px-4 py-2">
        <div className="text-xs font-medium text-muted-foreground mb-2 px-2 uppercase tracking-wider">
          Platform
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">Admin Workspace</p>
          </div>
          <Link href="/auth/login">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
