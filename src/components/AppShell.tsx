import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileUp, Sparkles, ListChecks, Video, Bot, LogOut, GraduationCap } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload PDF", icon: FileUp },
  { to: "/study", label: "Flashcards & Notes", icon: Sparkles },
  { to: "/quiz", label: "Quiz Builder", icon: ListChecks },
  { to: "/media", label: "Videos & Podcasts", icon: Video },
  { to: "/chat", label: "AI Chatbot", icon: Bot },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-64 flex-col glass border-r border-border/50 p-4 gap-2 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 px-3 py-4 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-aqua)", boxShadow: "var(--shadow-glow)" }}>
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold text-lg leading-tight gradient-text">ScholarAI</div>
            <div className="text-xs text-muted-foreground">Classes 6–10 · 2026-27</div>
          </div>
        </Link>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/15 text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          {session ? (
            <div className="glass rounded-xl p-3 space-y-2">
              <div className="text-xs text-muted-foreground truncate">{session.user.email}</div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => supabase.auth.signOut()}>
                <LogOut className="w-3.5 h-3.5 mr-2" /> Sign out
              </Button>
            </div>
          ) : (
            <Link to="/auth"><Button className="w-full" style={{ background: "var(--gradient-aqua)" }}>Sign in</Button></Link>
          )}
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}