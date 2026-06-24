"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isAnalyzing?: boolean;
}

export function FileUpload({ onFileSelect, isAnalyzing }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const validateFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return "仅支持 PDF 格式文件";
    }
    if (file.size > 50 * 1024 * 1024) {
      return "文件大小不能超过 50MB";
    }
    if (file.size === 0) {
      return "文件内容为空";
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        alert(error);
        return;
      }
      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect],
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
  }, []);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full",
        "rounded-xl border-2 border-dashed p-12 transition-all duration-200",
        dragActive
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
        selectedFile && "border-solid border-primary/30 bg-primary/5",
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {selectedFile ? (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="flex items-center gap-3 rounded-lg bg-primary/10 px-4 py-3">
            <FileText className="h-6 w-6 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {!isAnalyzing && (
              <button
                onClick={handleRemove}
                className="ml-2 rounded-full p-1 hover:bg-background/80 transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-base font-medium text-foreground">
              拖拽 PDF 文件到此处
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              或点击下方按钮选择文件
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>支持 PDF 格式</span>
            <span className="text-border">|</span>
            <span>最大 50MB</span>
          </div>
        </div>
      )}

      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleChange}
        className="absolute inset-0 cursor-pointer opacity-0"
        disabled={isAnalyzing}
      />
    </div>
  );
}
