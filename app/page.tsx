"use client";

import { useState, useCallback } from "react";
import { FileUpload } from "@/components/file-upload";
import { AnalysisProgress } from "@/components/analysis-progress";
import { AnalysisResult } from "@/components/analysis-result";
import { Button } from "@/components/ui/button";
import type { TenderAnalysis } from "@/lib/deepseek";
import { CheckCircle2, ArrowLeft } from "lucide-react";

const FEATURES = [
  "项目概况",
  "时间节点",
  "资格要求",
  "评分标准",
  "风险提示",
];

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TenderAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setError(null);
    setResult(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `请求失败 (${response.status})`,
        );
      }

      const data: TenderAnalysis = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "分析失败，请稍后重试",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedFile]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  }, []);

  if (result) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="mb-8">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              上传新文件
            </button>
          </div>

          <div className="mb-8 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <p className="text-sm text-muted-foreground">
              分析完成
            </p>
          </div>

          <AnalysisResult data={result} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            TenderCopilot
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            3分钟看懂500页招标文件
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {FEATURES.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        <div className="space-y-6">
          <FileUpload
            onFileSelect={handleFileSelect}
            isAnalyzing={isAnalyzing}
          />

          {selectedFile && !isAnalyzing && (
            <div className="flex justify-center animate-fade-in">
              <Button
                size="lg"
                onClick={handleAnalyze}
                className="px-8"
              >
                开始解析
              </Button>
            </div>
          )}

          {isAnalyzing && (
            <div className="py-8">
              <AnalysisProgress />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 animate-fade-in">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-muted-foreground">
          <p>TenderCopilot - AI招标文件智能解析助手</p>
        </footer>
      </div>
    </main>
  );
}
