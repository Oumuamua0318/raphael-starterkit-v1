import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Image, Sparkles } from "lucide-react";

export type LoadingStage = "analyzing" | "generating" | "complete";

interface LoadingProgressProps {
  stage: LoadingStage;
  progress: number;
  generatedCount?: number;
  maxImages?: number;
  className?: string;
}

export default function LoadingProgress({ 
  stage, 
  progress, 
  generatedCount = 0,
  maxImages = 10,
  className 
}: LoadingProgressProps) {
  const getStageConfig = () => {
    switch (stage) {
      case "analyzing":
        return {
          icon: Brain,
          title: "GPT-5 语义分析中...",
          description: "正在分析文章内容并提炼关键信息",
          color: "text-primary"
        };
      case "generating":
        return {
          icon: Image,
          title: `生成图片中 ${generatedCount}/${maxImages}`,
          description: "正在使用 FLUX.1 生成高质量插画",
          color: "text-primary"
        };
      case "complete":
        return {
          icon: Sparkles,
          title: "生成完成！",
          description: "所有图片已成功生成",
          color: "text-green-500"
        };
    }
  };

  const config = getStageConfig();
  const Icon = config.icon;

  return (
    <Card className={`p-8 ${className}`}>
      <div className="flex flex-col items-center text-center space-y-6">
        <div className={`p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 ${config.color}`}>
          <Icon className="h-8 w-8 animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{config.title}</h3>
          <p className="text-muted-foreground">{config.description}</p>
        </div>

        <div className="w-full max-w-md space-y-2">
          <Progress 
            value={progress} 
            className="h-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{Math.round(progress)}%</span>
            <span>本次最多将生成 {maxImages} 张图片</span>
          </div>
        </div>

        {stage === "generating" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span>AI 正在创作中，请稍候...</span>
          </div>
        )}
      </div>
    </Card>
  );
}
