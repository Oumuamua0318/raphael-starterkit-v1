'use client'

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Edit3, 
  RotateCcw, 
  Check, 
  X, 
  Crown,
  FileText,
  Palette
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GeneratedImage {
  id: string;
  url: string;
  originalText: string;
  prompt: string;
}

interface ResultDisplayProps {
  images: GeneratedImage[];
  isPremium?: boolean;
  onRetryGenerate?: (imageId: string, newPrompt: string) => void;
  onDownloadSingle?: (imageId: string) => void;
  onDownloadAll?: () => void;
  className?: string;
}

export default function ResultDisplay({ 
  images, 
  isPremium = false,
  onRetryGenerate,
  onDownloadSingle,
  onDownloadAll,
  className 
}: ResultDisplayProps) {
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [tempPrompt, setTempPrompt] = useState("");
  const { toast } = useToast();

  const handleEditPrompt = (imageId: string, currentPrompt: string) => {
    setEditingPrompt(imageId);
    setTempPrompt(currentPrompt);
  };

  const handleSavePrompt = (imageId: string) => {
    if (onRetryGenerate) {
      onRetryGenerate(imageId, tempPrompt);
    }
    setEditingPrompt(null);
    setTempPrompt("");
  };

  const handleCancelEdit = () => {
    setEditingPrompt(null);
    setTempPrompt("");
  };

  const handleRetryClick = (imageId: string) => {
    if (!isPremium) {
      toast({
        title: "升级至付费版",
        description: "免费用户无法使用重试生成功能，请升级至付费版解锁此功能。",
        variant: "destructive",
      });
      return;
    }
    
    const image = images.find(img => img.id === imageId);
    if (image) {
      handleEditPrompt(imageId, image.prompt);
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Download All Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            生成结果
          </h2>
          <p className="text-muted-foreground">共生成 {images.length} 张图片</p>
        </div>
        <Button 
          onClick={onDownloadAll}
          className="bg-primary hover:bg-primary/90"
          size="lg"
        >
          <Download className="h-4 w-4 mr-2" />
          批量下载 ZIP
        </Button>
      </div>

      {/* Results Grid */}
      <div className="space-y-8">
        {images.map((image, index) => (
          <Card key={image.id} className="p-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left: Image */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    <Palette className="h-3 w-3 mr-1" />
                    图片 {index + 1}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownloadSingle?.(image.id)}
                    className="border-border/50 hover:border-primary/50"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    下载
                  </Button>
                </div>
                
                <div className="relative w-full rounded-lg overflow-hidden bg-secondary/50">
                  <img 
                    src={image.url} 
                    alt={`Generated illustration ${index + 1}`}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>

              {/* Right: Text and Prompt */}
              <div className="space-y-6">
                {/* Original Text */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">对应原文</h4>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border/30">
                    <p className="text-sm leading-relaxed">{image.originalText}</p>
                  </div>
                </div>

                {/* Prompt */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">生成提示词</h4>
                    </div>
                    {editingPrompt !== image.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPrompt(image.id, image.prompt)}
                        className="h-7 px-2 text-xs hover:bg-secondary/50"
                      >
                        <Edit3 className="h-3 w-3 mr-1" />
                        编辑
                      </Button>
                    )}
                  </div>

                  {editingPrompt === image.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={tempPrompt}
                        onChange={(e) => setTempPrompt(e.target.value)}
                        className="bg-secondary/50 border-border/50 focus:border-primary/50"
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSavePrompt(image.id)}
                          className="bg-primary hover:bg-primary/90"
                          disabled={!isPremium}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          重新生成
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="border-border/50"
                        >
                          <X className="h-3 w-3 mr-1" />
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 bg-secondary/30 rounded-lg border border-border/30">
                        <p className="text-sm font-mono leading-relaxed">{image.prompt}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetryClick(image.id)}
                        className="border-border/50 hover:border-primary/50"
                        disabled={!isPremium}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        重试生成
                        {!isPremium && <Crown className="h-3 w-3 ml-1 text-primary" />}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
