'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { useCredits } from "@/hooks/use-credits";
import { useSubscription } from "@/hooks/use-subscription";
import Link from "next/link";
import JSZip from 'jszip';

import ArticleInput from "@/components/illustrator/ArticleInput";
import ConfigPanel, { StyleType, AspectRatio, ModelChoice } from "@/components/illustrator/ConfigPanel";
import LoadingProgress, { LoadingStage } from "@/components/illustrator/LoadingProgress";
import ResultDisplay from "@/components/illustrator/ResultDisplay";

export default function Home() {
  const [article, setArticle] = useState("");
  const [style, setStyle] = useState<StyleType>("插画");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [modelChoice, setModelChoice] = useState<ModelChoice>("flux");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("analyzing");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  
  const { user, loading: userLoading } = useUser();
  const { credits, refetchCredits } = useCredits();
  const { isSubscribed, status } = useSubscription();
  const { toast } = useToast();

  // 判断用户等级
  const getUserTier = (): 'free' | 'standard' => {
    if (!user) return 'free';
    if (status === 'active') return 'standard';
    return 'free';
  };

  const isPremium = isSubscribed;

  const handleGenerate = async () => {
    // 检查是否登录
      if (!user) {
      toast({
        title: "请先登录",
        description: "生成配图需要登录账户",
        variant: "destructive",
      });
      return;
    }

    if (!article.trim()) {
      toast({
        title: "请输入文章内容",
        description: "请先输入要配图的文章内容",
        variant: "destructive",
      });
      return;
    }

    if (article.length > 5000) {
      toast({
        title: "文章过长",
        description: "文章字数不能超过5000字",
        variant: "destructive",
      });
      return;
    }

    // 检查积分（免费用户）
    const userTier = getUserTier();
    if (userTier === 'free' && (!credits || credits.remaining_credits < 1)) {
      toast({
        title: "积分不足",
        description: "请购买积分或订阅会员",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setResults([]);
      setLoadingStage("analyzing");
      setProgress(5);

      let tickActive = true;
      const tick = setInterval(() => {
        setProgress((p) => {
          if (!tickActive) return p;
          const target = 60;
          if (p < target) return Math.min(target, p + 1);
          return p;
        });
      }, 100);

      const res = await fetch('/api/generate-illustration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article_text: article,
          user_tier: modelChoice === "seedream" ? "standard" : userTier,
          style_choice: style,
          aspect_ratio: aspectRatio,
        }),
      });

      const data = await res.json();

      setLoadingStage("generating");
      setProgress(60);

      if (!data.success) {
        throw new Error(data.error || "生成失败");
      }

      const built = (data.images || []).map((img: any, idx: number) => ({
        id: String(idx + 1),
        url: img.url,
        originalText: img.original_text,
        prompt: img.prompt,
      }));

      tickActive = false;
      clearInterval(tick);
      setProgress(100);
      setLoadingStage("complete");
      setResults(built);

      // 刷新积分显示
      refetchCredits();

      toast({
        title: "生成完成！",
        description: `成功为您生成了 ${built.length} 张配图`,
      });
    } catch (e: any) {
      toast({
        title: "生成失败",
        description: e?.message || "请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSingle = async (imageId: string) => {
    try {
      const img = results.find(r => r.id === imageId);
      if (!img) return;
      const res = await fetch(img.url, { mode: 'cors' }).catch(() => fetch(img.url));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${imageId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      toast({ title: '下载失败', description: '请稍后重试', variant: 'destructive' });
    }
  };

  const handleDownloadAll = async () => {
    try {
      const zip = new JSZip();
      const folder = zip.folder('images');
      for (let i = 0; i < results.length; i++) {
        const img = results[i];
        const res = await fetch(img.url, { mode: 'cors' }).catch(() => fetch(img.url));
        const blob = await res.blob();
        folder!.file(`image-${i + 1}.jpg`, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      toast({ title: '批量下载失败', description: '请稍后重试', variant: 'destructive' });
    }
  };

  const canGenerate = article.trim() && article.length <= 5000 && !isLoading && user;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-background/90">
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI 驱动的智能配图工具</span>
              </div>
              
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AI 文章智能配图工具
              </span>
              </h1>
              
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              基于 GPT-5 语义分析和 FLUX.1 图像生成技术，为你的文章自动生成高质量插图
            </p>

            {user && (
              <div className="flex items-center justify-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {credits?.remaining_credits || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">剩余积分</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {isPremium ? '会员' : '免费'}
                </div>
                  <div className="text-sm text-muted-foreground">用户等级</div>
                </div>
              </div>
            )}

            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sign-in">
                  <Button size="lg" className="text-lg h-14 px-8">
                    登录开始使用
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="lg" variant="outline" className="text-lg h-14 px-8">
                    免费注册
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {user && (
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Panel - Input & Configuration */}
            <div className="lg:col-span-2 space-y-6">
              <ArticleInput
                value={article}
                onChange={setArticle}
              />
              
              <ConfigPanel
                style={style}
                aspectRatio={aspectRatio}
                modelChoice={modelChoice}
                onStyleChange={setStyle}
                onAspectRatioChange={setAspectRatio}
                onModelChange={setModelChoice}
              />
              
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="w-full text-lg py-6"
                size="lg"
              >
                <Wand2 className="h-5 w-5 mr-2" />
                一键智能配图
              </Button>
                  </div>

            {/* Right Panel - Results */}
            <div className="lg:col-span-3">
              {isLoading && (
                <LoadingProgress
                  stage={loadingStage}
                  progress={progress}
                  generatedCount={Math.floor(progress / 20)}
                  maxImages={10}
                />
              )}
              
              {!isLoading && results.length > 0 && (
                <ResultDisplay
                  images={results}
                  isPremium={isPremium}
                  onDownloadSingle={handleDownloadSingle}
                  onDownloadAll={handleDownloadAll}
                />
              )}
              
              {!isLoading && results.length === 0 && (
                <div className="rounded-lg p-12 text-center border border-border">
                <div className="space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">开始您的创作之旅</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      在左侧输入您的文章内容，选择合适的风格和比例，然后点击"一键智能配图"按钮
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}