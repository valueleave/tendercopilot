import { NextRequest, NextResponse } from "next/server";
import { deepseekService } from "@/lib/deepseek";

export const config = {
  api: {
    bodyParser: false,
  },
};

// DeepSeek V3 context window ~64K tokens, keep more source text
const MAX_CHARS = 60000;
const API_TIMEOUT_MS = 180000;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "请上传 PDF 文件" },
        { status: 400 },
      );
    }

    if (!file.type.includes("pdf") && !(file instanceof File && file.name.toLowerCase().endsWith(".pdf"))) {
      return NextResponse.json(
        { error: "仅支持 PDF 格式文件" },
        { status: 400 },
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "文件大小不能超过 50MB" },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "文件内容为空" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let pdfText: string;
    try {
      const pdfParse = (await import("pdf-parse")).default;
      const pdfData = await pdfParse(buffer);
      pdfText = pdfData.text;
    } catch {
      return NextResponse.json(
        { error: "PDF 解析失败，请确认文件格式正确且未损坏" },
        { status: 422 },
      );
    }

    if (!pdfText.trim()) {
      return NextResponse.json(
        { error: "PDF 文件内容为空，请检查文件" },
        { status: 422 },
      );
    }

    // Truncate if too long
    const truncatedText =
      pdfText.length > MAX_CHARS
        ? pdfText.slice(0, MAX_CHARS) +
          `\n\n[注意：原始文件内容超过${MAX_CHARS}字符，已截取前${MAX_CHARS}字符进行分析]`
        : pdfText;

    // Request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const analysis = await deepseekService.analyze(truncatedText, {
        signal: controller.signal,
      });
      return NextResponse.json(analysis);
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("Analysis error:", error);

    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json(
        { error: "分析超时，文件内容可能过大，请尝试截取关键章节后重试" },
        { status: 408 },
      );
    }

    const message =
      error instanceof Error ? error.message : "分析过程出现未知错误";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
