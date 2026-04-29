import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Hero3D } from "@/components/Hero3D";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { FileUp, Sparkles, ListChecks, Video, Bot, ArrowRight, BookOpen } from "lucide-react";

export const Route = createFileRoute("/")({ component: Dashboard });

const CLASSES = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];

function Dashboard() {
  const [selectedClass, setSelectedClass] = useState("Class 8");
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("uploads").select("*").order("created_at", { ascending: false }).limit(6)
      .then(({ data }) => setRecent(data || []));
  }, []);

  const quickActions = [
    { to: "/upload", label: "Upload PDF", desc: "Drop a textbook chapter", icon: FileUp, gradient: "var(--gradient-aqua)" },
    { to: "/study", label: "Generate Notes", desc: "AI flashcards & summaries", icon: Sparkles, gradient: "var(--gradient-lime)" },
    { to: "/quiz", label: "Build a Quiz", desc: "MCQs from any chapter", icon: ListChecks, gradient: "var(--gradient-aqua)" },
    { to: "/chat", label: "Ask AI Tutor", desc: "Voice + text Q&A", icon: Bot, gradient: "var(--gradient-lime)" },
  ];

  return (
    <AppShell>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[520px] flex items-center px-6 md:px-12 py-16">
        <Hero3D />
        <div className="relative z-10 max-w-3xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-accent glow-pulse" /> Session 2026-27 · Live
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-4">
            Teach <span className="gradient-text">smarter</span>,<br />
            not <span className="gradient-text-lime">harder</span>.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8">
            Upload chapters. Generate flashcards, notes, quizzes, and MCQs in seconds.
            Discover videos, podcasts, and chat with an AI tutor — all in one classroom hub.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/upload">
              <Button size="lg" className="text-base h-12 px-6" style={{ background: "var(--gradient-aqua)", boxShadow: "var(--shadow-glow)" }}>
                <FileUp className="w-5 h-5 mr-2" /> Upload Chapter
              </Button>
            </Link>
            <Link to="/chat">
              <Button size="lg" variant="outline" className="text-base h-12 px-6 glass">
                <Bot className="w-5 h-5 mr-2" /> Try AI Tutor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Class selector */}
      <section className="px-6 md:px-12 py-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Choose your class</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {CLASSES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedClass(c)}
              className={`px-5 py-3 rounded-xl font-semibold text-sm transition-all card-3d ${
                selectedClass === c ? "ring-2 ring-primary scale-105" : ""
              }`}
              style={selectedClass === c ? { background: "var(--gradient-aqua)" } : {}}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="px-6 md:px-12 py-8">
        <h2 className="text-xl font-bold mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((a, i) => {
            const Icon = a.icon;
            return (
              <Link key={a.to} to={a.to} className="block animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <Card className="card-3d p-6 h-full border-0 cursor-pointer">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: a.gradient, boxShadow: "var(--shadow-card)" }}>
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="font-bold text-lg mb-1">{a.label}</div>
                  <div className="text-sm text-muted-foreground mb-3">{a.desc}</div>
                  <div className="text-xs font-medium text-primary inline-flex items-center gap-1">
                    Open <ArrowRight className="w-3 h-3" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent uploads */}
      <section className="px-6 md:px-12 py-8 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent uploads</h2>
          <Link to="/upload" className="text-sm text-primary font-medium">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <Card className="card-3d p-12 text-center border-0">
            <FileUp className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <div className="font-semibold mb-1">No uploads yet</div>
            <div className="text-sm text-muted-foreground mb-4">Upload your first chapter PDF to start generating study material.</div>
            <Link to="/upload"><Button style={{ background: "var(--gradient-aqua)" }}>Upload now</Button></Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((r) => (
              <Card key={r.id} className="card-3d p-5 border-0">
                <div className="text-xs uppercase tracking-wide text-primary font-semibold mb-2">{r.category}</div>
                <div className="font-bold mb-1">{r.title}</div>
                <div className="text-xs text-muted-foreground">{r.class_level || "All classes"} · {new Date(r.created_at).toLocaleDateString()}</div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
