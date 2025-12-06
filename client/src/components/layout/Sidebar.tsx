import { NavLink } from "react-router-dom";
import { Search, FileText, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

const navItemClasses =
  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors";
const activeClasses = "bg-primary/10 text-primary";
const inactiveClasses = "text-muted-foreground hover:bg-muted";

export function Sidebar() {
  const { signOut } = useAuthStore();

  return (
    <aside className="w-64 border-r bg-background flex flex-col">
      <div className="px-4 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">L</span>
          </div>
          <div>
            <div className="font-semibold">Lumina</div>
            <div className="text-xs text-muted-foreground">AI Knowledge</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        <NavLink
          to="/search"
          className={({ isActive }) =>
            `${navItemClasses} ${
              isActive ? activeClasses : inactiveClasses
            } gap-2`
          }
        >
          <Search className="w-4 h-4" />
          Search Knowledge
        </NavLink>

        <NavLink
          to="/documents"
          className={({ isActive }) =>
            `${navItemClasses} ${
              isActive ? activeClasses : inactiveClasses
            } gap-2`
          }
        >
          <FileText className="w-4 h-4" />
          Documents
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `${navItemClasses} ${
              isActive ? activeClasses : inactiveClasses
            } gap-2`
          }
        >
          <Settings className="w-4 h-4" />
          Settings
        </NavLink>
      </nav>

      <div className="px-2 py-4 border-t">
        <button
          className={`${navItemClasses} ${inactiveClasses} w-full justify-start`}
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
