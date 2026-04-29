// AI Study endpoint — handles chat, flashcards, quiz, summary via Lovable AI
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, messages, prompt, stream } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt = "You are a friendly AI study assistant for school students at St. Michael Sr Sec School.";
    let userMessages = messages || [{ role: "user", content: prompt }];

    if (mode === "flashcards") {
      systemPrompt = "Generate study flashcards. Reply ONLY with a JSON array of {front, back} objects. No prose.";
    } else if (mode === "quiz") {
      systemPrompt = "Generate multiple-choice quiz questions. Reply ONLY with JSON array of {question, options:[4 strings], answerIndex:number, explanation} objects. No prose.";
    } else if (mode === "notes") {
      systemPrompt = "Generate concise, well-structured study notes in markdown with headings, bullet points, and key terms in **bold**.";
    }

    const body: any = {
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "system", content: systemPrompt }, ...userMessages],
    };
    if (stream) body.stream = true;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit reached. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable workspace." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await resp.text();
      return new Response(JSON.stringify({ error: "AI gateway error", detail: t }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (stream) {
      return new Response(resp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
    }

    const data = await resp.json();
    return new Response(JSON.stringify({ content: data.choices?.[0]?.message?.content ?? "" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});