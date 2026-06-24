"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "正在解析招标文件...", progress: 25 },
  { label: "正在提取关键要求...", progress: 50 },
  { label: "正在识别评分规则...", progress: 75 },
  { label: "正在生成分析报告...", progress: 100 },
];

export function AnalysisProgress() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= STEPS.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
      setProgress(STEPS[Math.min(currentStep + 1, STEPS.length - 1)].progress);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <Progress value={progress} className="h-2" />

      <div className="space-y-3">
        {STEPS.map((step, index) => (
          <div
            key={step.label}
            className={cn(
              "flex items-center gap-3 text-sm transition-all duration-500",
              index < currentStep
                ? "text-primary"
                : index === currentStep
                  ? "text-foreground font-medium"
                  : "text-muted-foreground/40",
            )}
          >
            <div
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                index < currentStep && "bg-primary",
                index === currentStep && "bg-primary animate-pulse",
                index > currentStep && "bg-muted-foreground/20",
              )}
            />
            <span>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
