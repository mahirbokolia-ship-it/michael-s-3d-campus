import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Send, Bot, User, Volume2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({ component: ChatPage });

type Msg = { role: "user" | "assistant"; content: string };

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your AI tutor 👋 Ask me anything about classes 6-10 — I can explain concepts, solve problems, or help plan a lesson. You can also tap the mic to speak." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function speak(text: string) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1; u.pitch = 1;
      window.speechSynthesis.speak(u);
    } catch {}
  }

  function toggleMic() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return toast.error("Voice input not supported in this browser");
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const r = new SR(); r.lang = "en-US"; r.interimResults = false;
    r.onresult = (e: any) => { const t = e.results[0][0].transcript; setInput(t); setTimeout(() => send(t), 100); };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start(); recRef.current = r; setListening(true);
  }

  async function send(textOverride?: string) {
    const text = textOverride ?? input;
    if (!text.trim()) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next); setInput(""); setLoading(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-study`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: next, stream: true }),
      });
      if (!resp.ok || !resp.body) {
        if (resp.status === 429) throw new Error("Rate limit reached. Try again shortly.");
        if (resp.status === 402) throw new Error("AI credits exhausted.");
        throw new Error("Chat failed");
      }
      const reader = resp.body.getReader(); const decoder = new TextDecoder();
      let buf = ""; let assistant = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx); buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") continue;
          try {
            const parsed = JSON.parse(j);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) {
              assistant += c;
              setMessages((m) => { const copy = [...m]; copy[copy.length - 1] = { role: "assistant", content: assistant }; return copy; });
            }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
      if (assistant) speak(assistant.replace(/[*_`#>\-\[\]()]/g, "").slice(0, 400));
    } catch (e: any) {
      toast.error(e.message || "Failed");
      setMessages((m) => m.slice(0, -1));
    } finally { setLoading(false); }
  }

  return (
    <AppShell>
      <div className="px-6 md:px-12 py-10 h-[calc(100vh-0px)] flex flex-col max-w-4xl">
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold mb-2">AI <span className="gradient-text">Tutor</span> <span className="text-2xl">·</span> <span className="gradient-text-lime">Voice + Text</span></h1>
          <p className="text-muted-foreground">Conversational, like Gemini. Tap the mic to speak.</p>
        </div>

        <Card className="card-3d border-0 flex-1 flex flex-col min-h-0 p-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 animate-fade-in-up ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: m.role === "user" ? "var(--gradient-lime)" : "var(--gradient-aqua)" }}>
                  {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`rounded-2xl px-4 py-3 max-w-[80%] ${m.role === "user" ? "bg-primary/15" : "glass"}`}>
                  <article className="prose prose-sm max-w-none">
                    <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                  </article>
                  {m.role === "assistant" && m.content && (
                    <button onClick={() => speak(m.content.replace(/[*_`#>\-\[\]()]/g, ""))} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mt-2">
                      <Volume2 className="w-3 h-3" /> Replay
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="border-t p-4 flex gap-2">
            <Button type="button" size="icon" variant={listening ? "default" : "outline"} onClick={toggleMic} className={listening ? "glow-pulse" : ""} style={listening ? { background: "var(--gradient-lime)" } : {}}>
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={listening ? "Listening…" : "Ask the AI tutor anything…"}
              disabled={loading}
              className="h-11"
            />
            <Button onClick={() => send()} disabled={loading || !input.trim()} size="icon" style={{ background: "var(--gradient-aqua)" }}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}