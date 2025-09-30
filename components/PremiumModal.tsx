'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Sparkles, 
  RotateCcw, 
  Zap, 
  Check,
  X
} from "lucide-react";

interface PremiumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade?: () => void;
}

export default function PremiumModal({ open, onOpenChange, onUpgrade }: PremiumModalProps) {
  const features = [
    {
      icon: Sparkles,
      title: "无限制配图次数",
      description: "每月最多 100 次完整文章配图",
      included: true
    },
    {
      icon: RotateCcw,
      title: "重试生成功能",
      description: "不满意的图片可以重新生成",
      included: true
    },
    {
      icon: Zap,
      title: "优先处理队列",
      description: "享受更快的生成速度",
      included: true
    },
    {
      icon: Crown,
      title: "高级风格选项",
      description: "解锁更多视觉风格和效果",
      included: false,
      comingSoon: true
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border/50">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
            <Crown className="h-8 w-8 text-accent" />
          </div>
          <DialogTitle className="text-2xl gradient-text">
            升级至付费版
          </DialogTitle>
          <DialogDescription className="text-base">
            解锁更多强大功能，提升您的创作体验
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                <div className={`p-2 rounded-lg ${
                  feature.included 
                    ? 'bg-success/10 text-success' 
                    : 'bg-muted/20 text-muted-foreground'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    {feature.included && (
                      <Check className="h-4 w-4 text-success" />
                    )}
                    {feature.comingSoon && (
                      <Badge variant="secondary" className="text-xs px-2 py-0">
                        即将推出
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t border-border/30">
          <Button 
            onClick={onUpgrade}
            className="hero-button w-full"
            size="lg"
          >
            <Crown className="h-4 w-4 mr-2" />
            立即升级
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            稍后再说
          </Button>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            免费用户每月仅有 3 次配图额度
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
