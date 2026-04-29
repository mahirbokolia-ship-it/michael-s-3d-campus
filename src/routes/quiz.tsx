import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ListChecks, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/quiz")({ component: QuizPage });

type Q = { question: string; options: string[]; answerIndex: number; explanation: string };

function QuizPage() {
  const [classLevel, setClassLevel] = useState("Class 8");
  const [chapter, setChapter] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  async function generate() {
    if (!chapter) return toast.error("Enter a chapter");
    setLoading(true);
    try {
      const prompt = `${classLevel}, Chapter: ${chapter}. Generate ${count} multiple-choice questions.`;
      const { data, error } = await supabase.functions.invoke("ai-study", { body: { mode: "quiz", prompt } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const parsed = JSON.parse(data.content.replace(/```json|```/g, "").trim());
      setQuestions(Array.isArray(parsed) ? parsed : parsed.questions || []);
      setAnswers({}); setSubmitted(false);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }

  const score = questions.reduce((s, q, i) => s + (answers[i] === q.answerIndex ? 1 : 0), 0);

  return (
    <AppShell>
      <div className="px-6 md:px-12 py-10">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold mb-2">Quiz & <span className="gradient-text">MCQ</span> Builder</h1>
          <p className="text-muted-foreground">Chapter-specific assessments — instant, AI-graded.</p>
        </div>

        <Card className="card-3d border-0 p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-3 items-end">
            <div>
              <Label>Class</Label>
              <Select value={classLevel} onValueChange={setClassLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Class 6","Class 7","Class 8","Class 9","Class 10"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Chapter</Label>
              <Input value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="e.g., The French Revolution" />
            </div>
            <div>
              <Label>How many?</Label>
              <Select value={String(count)} onValueChange={(v) => setCount(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[5,10,15,20].map(n => <SelectItem key={n} value={String(n)}>{n} questions</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={generate} disabled={loading} className="mt-4" style={{ background: "var(--gradient-lime)" }}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ListChecks className="w-4 h-4 mr-2" />} Build Quiz
          </Button>
        </Card>

        {questions.length > 0 && (
          <div className="space-y-4">
            {questions.map((q, i) => (
              <Card key={i} className="card-3d border-0 p-6 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0" style={{ background: "var(--gradient-aqua)" }}>{i + 1}</div>
                  <div className="font-semibold">{q.question}</div>
                </div>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const picked = answers[i] === oi;
                    const correct = submitted && oi === q.answerIndex;
                    const wrong = submitted && picked && oi !== q.answerIndex;
                    return (
                      <button
                        key={oi}
                        disabled={submitted}
                        onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                        className={`w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3 ${
                          correct ? "border-green-500 bg-green-50" :
                          wrong ? "border-red-500 bg-red-50" :
                          picked ? "border-primary bg-primary/10" : "hover:border-primary/60"
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0">
                          {String.fromCharCode(65 + oi)}
                        </div>
                        <span className="flex-1">{opt}</span>
                        {correct && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                        {wrong && <XCircle className="w-5 h-5 text-red-600" />}
                      </button>
                    );
                  })}
                </div>
                {submitted && q.explanation && (
                  <div className="mt-3 p-3 rounded-lg bg-accent/20 text-sm">
                    <strong>Why:</strong> {q.explanation}
                  </div>
                )}
              </Card>
            ))}
            <div className="flex gap-3">
              {!submitted ? (
                <Button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length !== questions.length} style={{ background: "var(--gradient-aqua)" }}>
                  Submit answers
                </Button>
              ) : (
                <>
                  <div className="card-3d rounded-xl px-6 py-3 font-bold" style={{ background: "var(--gradient-lime)" }}>
                    Score: {score} / {questions.length}
                  </div>
                  <Button variant="outline" onClick={() => { setSubmitted(false); setAnswers({}); }}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}