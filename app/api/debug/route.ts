import { NextRequest, NextResponse } from "next/server";

export const config = { api: { bodyParser: false } };

// Debug: calls DeepSeek with minimal prompt, returns raw response structure
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "no file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfParse = (await import("pdf-parse")).default;
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text.slice(0, 5000);

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "no API key" }, { status: 500 });

    const RES = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful assistant. Return your response as JSON." },
          { role: "user", content: `Analyze this tender document:\n${text.slice(0, 2000)}` },
        ],
        temperature: 0.1,
        max_tokens: 1024,
      }),
    });

    const raw = await RES.json();
    return NextResponse.json({
      status: RES.status,
      keys: Object.keys(raw),
      choice0_keys: raw.choices?.[0] ? Object.keys(raw.choices[0]) : null,
      message_keys: raw.choices?.[0]?.message ? Object.keys(raw.choices[0].message) : null,
      has_tool_calls: !!raw.choices?.[0]?.message?.tool_calls,
      tool_calls: raw.choices?.[0]?.message?.tool_calls ?? null,
      finish_reason: raw.choices?.[0]?.finish_reason ?? null,
      content_preview: (raw.choices?.[0]?.message?.content || "").slice(0, 1000),
      full_sample: JSON.stringify(raw.choices?.[0]).slice(0, 3000),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
