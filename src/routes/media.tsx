import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Play, Headphones, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/media")({ component: MediaPage });

const VIDEOS = [
  { title: "Photosynthesis Explained", channel: "Khan Academy", subject: "Science · Class 7", thumb: "https://img.youtube.com/vi/D1Ymc311XS8/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=D1Ymc311XS8" },
  { title: "Quadratic Equations", channel: "Vedantu", subject: "Maths · Class 10", thumb: "https://img.youtube.com/vi/i7idZfS8t8w/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=i7idZfS8t8w" },
  { title: "The French Revolution", channel: "CrashCourse", subject: "History · Class 9", thumb: "https://img.youtube.com/vi/lTTvKwCylFY/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=lTTvKwCylFY" },
  { title: "Light – Reflection & Refraction", channel: "Magnet Brains", subject: "Physics · Class 10", thumb: "https://img.youtube.com/vi/b6UQRz2LjNk/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=b6UQRz2LjNk" },
  { title: "Cell Structure", channel: "BYJU's", subject: "Biology · Class 8", thumb: "https://img.youtube.com/vi/URUJD5NEXC8/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=URUJD5NEXC8" },
  { title: "Algebra Basics", channel: "Khan Academy", subject: "Maths · Class 6", thumb: "https://img.youtube.com/vi/NybHckSEQBI/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=NybHckSEQBI" },
];

const PODCASTS = [
  { title: "Stuff You Should Know", host: "iHeart", subject: "General knowledge", color: "var(--gradient-aqua)" },
  { title: "Science Vs", host: "Spotify Studios", subject: "Science", color: "var(--gradient-lime)" },
  { title: "Short Wave", host: "NPR", subject: "Daily science", color: "var(--gradient-aqua)" },
  { title: "Brains On!", host: "American Public Media", subject: "For kids", color: "var(--gradient-lime)" },
  { title: "TED-Ed", host: "TED", subject: "Education", color: "var(--gradient-aqua)" },
  { title: "But Why", host: "Vermont Public", subject: "Curious questions", color: "var(--gradient-lime)" },
];

function MediaPage() {
  const [q, setQ] = useState("");
  const filtV = VIDEOS.filter(v => v.title.toLowerCase().includes(q.toLowerCase()) || v.subject.toLowerCase().includes(q.toLowerCase()));
  const filtP = PODCASTS.filter(p => p.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell>
      <div className="px-6 md:px-12 py-10">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold mb-2">Videos & <span className="gradient-text">Podcasts</span></h1>
          <p className="text-muted-foreground">Curated learning media for classes 6-10.</p>
        </div>

        <div className="relative mb-6 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search videos and podcasts…" className="pl-10 h-11 glass" />
        </div>

        <Tabs defaultValue="videos">
          <TabsList className="glass">
            <TabsTrigger value="videos"><Play className="w-3.5 h-3.5 mr-2" /> Videos</TabsTrigger>
            <TabsTrigger value="podcasts"><Headphones className="w-3.5 h-3.5 mr-2" /> Podcasts</TabsTrigger>
          </TabsList>
          <TabsContent value="videos">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtV.map((v, i) => (
                <a key={i} href={v.url} target="_blank" rel="noreferrer" className="block">
                  <Card className="card-3d border-0 overflow-hidden">
                    <div className="relative aspect-video bg-muted">
                      <img src={v.thumb} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "var(--gradient-aqua)" }}>
                          <Play className="w-6 h-6 fill-current" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="font-bold leading-tight mb-1">{v.title}</div>
                      <div className="text-xs text-muted-foreground">{v.channel} · {v.subject}</div>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="podcasts">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtP.map((p, i) => (
                <Card key={i} className="card-3d border-0 p-6">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ background: p.color, boxShadow: "var(--shadow-card)" }}>
                    <Headphones className="w-6 h-6 text-foreground" />
                  </div>
                  <div className="font-bold mb-1">{p.title}</div>
                  <div className="text-xs text-muted-foreground mb-3">{p.host} · {p.subject}</div>
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(p.title + " podcast")}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary inline-flex items-center gap-1">
                    Listen <ExternalLink className="w-3 h-3" />
                  </a>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}