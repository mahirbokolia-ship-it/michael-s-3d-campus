import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileUp, FileText, Loader2, BookOpen } from "lucide-react";

export const Route = createFileRoute("/upload")({ component: UploadPage });

function UploadPage() {
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [classLevel, setClassLevel] = useState("Class 8");
  const [chapter, setChapter] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = () => supabase.from("uploads").select("*").eq("category", "notes").order("created_at", { ascending: false }).then(({ data }) => setUploads(data || []));
  useEffect(() => { refresh(); }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) { setFile(f); setTitle(f.name.replace(/\.pdf$/i, "")); }
  }

  async function upload() {
    if (!file) return toast.error("Pick a PDF first");
    const { data: { user } } = await supabase.auth.getUser();
    setUploading(true);
    try {
      const folder = user?.id ?? "anonymous";
      const path = `${folder}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("school-uploads").upload(path, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("school-uploads").getPublicUrl(path);
      const { error: dbErr } = await supabase.from("uploads").insert({
        uploader_id: user?.id ?? null, category: "notes", title: title || file.name,
        description: chapter, file_url: publicUrl, class_level: classLevel,
      });
      if (dbErr) throw dbErr;
      toast.success("PDF uploaded! You can now generate flashcards & quizzes.");
      setFile(null); setTitle(""); setChapter(""); refresh();
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally { setUploading(false); }
  }

  return (
    <AppShell>
      <div className="px-6 md:px-12 py-10 max-w-5xl">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold mb-2">Upload <span className="gradient-text">PDF Chapter</span></h1>
          <p className="text-muted-foreground">Drag & drop a chapter PDF. We'll let you generate study material from it.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="card-3d border-0 p-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all ${
                drag ? "border-primary bg-primary/10 scale-[1.02]" : "border-border hover:border-primary/60"
              }`}
            >
              <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => {
                const f = e.target.files?.[0]; if (f) { setFile(f); setTitle(f.name.replace(/\.pdf$/i, "")); }
              }} />
              {file ? (
                <div>
                  <FileText className="w-14 h-14 mx-auto mb-3 text-primary" />
                  <div className="font-bold">{file.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              ) : (
                <div>
                  <FileUp className="w-14 h-14 mx-auto mb-3 text-primary float-anim" />
                  <div className="font-bold mb-1">Drop your PDF here</div>
                  <div className="text-xs text-muted-foreground">or click to browse · PDF only</div>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <Label>Chapter title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Light – Reflection and Refraction" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Class</Label>
                  <Select value={classLevel} onValueChange={setClassLevel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Chapter / Topic</Label>
                  <Input value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="Ch 10" />
                </div>
              </div>
              <Button onClick={upload} disabled={uploading || !file} className="w-full h-11" style={{ background: "var(--gradient-aqua)" }}>
                {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading…</> : "Upload PDF"}
              </Button>
            </div>
          </Card>

          <Card className="card-3d border-0 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Your chapters</h2>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-auto">
              {uploads.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">No chapters uploaded yet.</div>
              ) : uploads.map((u) => (
                <div key={u.id} className="p-3 rounded-lg border bg-card/60 hover:bg-card transition-colors">
                  <div className="font-semibold text-sm">{u.title}</div>
                  <div className="text-xs text-muted-foreground">{u.class_level} · {u.description || "—"}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}