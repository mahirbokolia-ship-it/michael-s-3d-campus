import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2, RotateCw } from "lucide-react";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/study")({ component: StudyPage });

function StudyPage() {
  const [classLevel, setClassLevel] = useState("Class 8");
  const [chapter, setChapter] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [cards, setCards] = useState<{ front: string; back: string }[]>([]);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  async function generate(mode: "notes" | "flashcards") {
    if (!chapter) return toast.error("Enter a chapter or topic");
    setLoading(true);
    try {
      const prompt = `${classLevel}, Chapter/Topic: ${chapter}.${context ? ` Context: ${context}` : ""} Generate ${mode === "notes" ? "comprehensive study notes" : "10 high-quality flashcards"}.`;
      const { data, error } = await supabase.functions.invoke("ai-study", { body: { mode, prompt } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (mode === "notes") setNotes(data.content);
      else {
        const txt = data.content.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(txt);
        setCards(Array.isArray(parsed) ? parsed : parsed.flashcards || []);
        setFlipped({});
      }
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally { setLoading(false); }
  }

  return (
    <AppShell>
      <div className="px-6 md:px-12 py-10">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold mb-2">Flashcards & <span className="gradient-text-lime">Notes</span></h1>
          <p className="text-muted-foreground">AI-generated study material — pick a chapter and let ScholarAI do the work.</p>
        </div>

        <Card className="card-3d border-0 p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-3 mb-3">
            <div>
              <Label>Class</Label>
              <Select value={classLevel} onValueChange={setClassLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Chapter / Topic</Label>
              <Input value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="e.g., Photosynthesis, Quadratic Equations" />
            </div>
          </div>
          <div className="mb-3">
            <Label>Optional context (paste key paragraphs)</Label>
            <Textarea rows={3} value={context} onChange={(e) => setContext(e.target.value)} placeholder="Paste a few lines from the chapter for more accurate output…" />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => generate("notes")} disabled={loading} style={{ background: "var(--gradient-aqua)" }}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />} Generate Notes
            </Button>
            <Button onClick={() => generate("flashcards")} disabled={loading} variant="outline" className="glass">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />} Generate Flashcards
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="glass">
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="cards">Flashcards ({cards.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="notes">
            <Card className="card-3d border-0 p-8 min-h-[300px]">
              {notes ? (
                <article className="prose prose-sm md:prose-base max-w-none">
                  <ReactMarkdown>{notes}</ReactMarkdown>
                </article>
              ) : (
                <div className="text-center text-muted-foreground py-16">Generated notes will appear here.</div>
              )}
            </Card>
          </TabsContent>
          <TabsContent value="cards">
            {cards.length === 0 ? (
              <Card className="card-3d border-0 p-12 text-center text-muted-foreground">Generate flashcards to view them here.</Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
                    className="card-3d rounded-xl p-6 min-h-[180px] cursor-pointer flex flex-col justify-between"
                    style={{ background: flipped[i] ? "var(--gradient-lime)" : "var(--gradient-aqua)" }}
                  >
                    <div className="text-xs font-bold uppercase tracking-wide opacity-80">
                      {flipped[i] ? "Answer" : `Q${i + 1}`}
                    </div>
                    <div className="font-semibold text-foreground">{flipped[i] ? c.back : c.front}</div>
                    <div className="text-xs flex items-center gap-1 opacity-70"><RotateCw className="w-3 h-3" /> Tap to flip</div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}