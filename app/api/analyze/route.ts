import { NextRequest, NextResponse } from "next/server";
import { deepseekService } from "@/lib/deepseek";

export const config = {
  api: {
    bodyParser: false,
  },
};

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

    // Validate file type
    if (!file.type.includes("pdf") && !(file instanceof File && file.name.toLowerCase().endsWith(".pdf"))) {
      return NextResponse.json(
        { error: "仅支持 PDF 格式文件" },
        { status: 400 },
      );
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "文件大小不能超过 50MB" },
        { status: 400 },
      );
    }

    // Validate empty file
    if (file.size === 0) {
      return NextResponse.json(
        { error: "文件内容为空" },
        { status: 400 },
      );
    }

    // Read PDF content
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF text
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

    // Truncate text if too long (DeepSeek context limit ~64k tokens)
    const maxChars = 30000;
    const truncatedText =
      pdfText.length > maxChars
        ? pdfText.slice(0, maxChars) +
          `\n\n[注意：原始文件内容超过${maxChars}字符，已截取前${maxChars}字符进行分析]`
        : pdfText;

    // Call DeepSeek API
    const analysis = await deepseekService.analyze(truncatedText);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);

    const message =
      error instanceof Error ? error.message : "分析过程出现未知错误";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
