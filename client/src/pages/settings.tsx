import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useSettingsStore } from "@/lib/settings-store";
import { useAuthStore } from "@/lib/auth-store";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Search,
  User,
  Monitor,
  Info,
} from "lucide-react";
import { useState } from "react";

const TABS = [
  { id: "general", label: "General", icon: Settings },
  { id: "search", label: "Search", icon: Search },
  { id: "account", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Monitor },
  { id: "about", label: "About", icon: Info },
];

export default function SettingsPage() {
  const { topK, setTopK } = useSettingsStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("general");

  return (
    <DashboardLayout>
      <div className="flex h-full w-full">

        <aside className="w-64 border-r bg-muted/20 px-4 py-6">
          <h1 className="text-xl font-semibold mb-6 px-2">Settings</h1>

          <nav className="space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm transition
                ${activeTab === id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 px-10 py-8 overflow-auto">

          {activeTab === "general" && (
            <section className="space-y-8 max-w-2xl">
              <h2 className="text-lg font-semibold">General Preferences</h2>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts when document indexing finishes.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-save Chats</p>
                  <p className="text-sm text-muted-foreground">
                    Keep your conversation history between sessions.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </section>
          )}

          {activeTab === "search" && (
            <section className="space-y-8 max-w-3xl">
              <h2 className="text-lg font-semibold">Search Settings</h2>

              <div className="space-y-3">
                <label className="font-medium">Number of chunks (topK)</label>
                <Slider
                  value={[topK]}
                  onValueChange={(v) => setTopK(v[0])}
                  min={1}
                  max={20}
                />
                <p className="text-sm text-muted-foreground">
                  Current: <strong>{topK}</strong> chunks
                </p>
              </div>

              <div className="space-y-3">
                <label className="font-medium">Relevance Sensitivity</label>
                <Slider defaultValue={[75]} min={50} max={100} />
                <p className="text-sm text-muted-foreground">
                  Higher sensitivity reduces irrelevant matches.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Follow-up Question Hints</p>
                  <p className="text-sm text-muted-foreground">
                    Shows suggestions under the search bar.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </section>
          )}

          {activeTab === "account" && (
            <section className="space-y-8 max-w-xl">
              <h2 className="text-lg font-semibold">Account</h2>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <Input value={user?.email ?? ""} disabled />
              </div>

              <Button variant="destructive" className="mt-4">
                Log Out
              </Button>
            </section>
          )}

          {activeTab === "appearance" && (
            <section className="space-y-8 max-w-xl">
              <h2 className="text-lg font-semibold">Appearance</h2>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark theme.
                  </p>
                </div>
                <Switch />
              </div>

              <div className="space-y-2">
                <label className="font-medium">Text Size</label>
                <Slider defaultValue={[16]} min={12} max={24} />
              </div>
            </section>
          )}

          {activeTab === "about" && (
            <section className="space-y-6 max-w-2xl">
              <h2 className="text-lg font-semibold">About Lumina</h2>

              <p className="text-muted-foreground">
                Lumina is your personal AI knowledge assistant, helping you
                search, summarize, and extract insights from your uploaded
                documents.
              </p>

              <div className="text-sm space-y-1">
                <p>Version: <strong>1.0.0</strong></p>
                <p>Last Updated: Jan 2025</p>
              </div>

              <Button variant="outline">View Changelog</Button>
            </section>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}