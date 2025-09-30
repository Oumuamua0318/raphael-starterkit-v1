"use client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Square, RectangleHorizontal, RectangleVertical } from "lucide-react";

export type StyleType = "真实照片" | "插画" | "漫画" | "水墨" | "油画" | "素描";
export type AspectRatio = "1:1" | "16:9" | "9:16" | "3:4" | "4:3" | "2:3" | "3:2";
export type ModelChoice = "flux" | "seedream";

interface ConfigPanelProps {
  style: StyleType;
  aspectRatio: AspectRatio;
  modelChoice?: ModelChoice;
  onStyleChange: (style: StyleType) => void;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onModelChange?: (model: ModelChoice) => void;
  className?: string;
}

export default function ConfigPanel({
  style,
  aspectRatio,
  modelChoice = "flux",
  onStyleChange,
  onAspectRatioChange,
  onModelChange,
  className
}: ConfigPanelProps) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-8">
        {/* Style Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              图片风格
            </h3>
          </div>

          <RadioGroup value={style} onValueChange={(value) => onStyleChange(value as StyleType)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: '真实照片', title: '真实照片', desc: '强调光影、细节和质感，适用于专业、严谨或纪实性的内容。' },
                { id: '插画', title: '插画', desc: '清晰、生动的数字艺术风格，适合轻松、活泼或概念性的内容。' },
                { id: '漫画', title: '漫画', desc: '强调叙事性、线条和动感，具有手绘的独特魅力。' },
                { id: '水墨', title: '水墨', desc: '传统东方艺术风格，强调留白、意境和笔触的韵味。' },
                { id: '油画', title: '油画', desc: '强调笔触的厚重感与色彩层次，适合宏大或古典主题。' },
                { id: '素描', title: '素描', desc: '强调线条、明暗对比与造型能力，专注结构与轮廓。' },
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value={item.id} id={`style-${item.id}`} className="border-primary text-primary" />
                  <Label htmlFor={`style-${item.id}`} className="cursor-pointer flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Aspect Ratio Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Square className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              图片比例
            </h3>
          </div>

          <RadioGroup value={aspectRatio} onValueChange={(v) => onAspectRatioChange(v as AspectRatio)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: '1:1', label: '1:1 方形', icon: 'square' },
                { id: '16:9', label: '16:9 横向', icon: 'h' },
                { id: '9:16', label: '9:16 纵向', icon: 'v' },
                { id: '4:3', label: '4:3 横向', icon: 'h' },
                { id: '3:2', label: '3:2 横向', icon: 'h' },
                { id: '3:4', label: '3:4 纵向', icon: 'v' },
                { id: '2:3', label: '2:3 纵向', icon: 'v' },
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value={item.id as AspectRatio} id={`ar-${item.id}`} className="border-primary text-primary" />
                  <Label htmlFor={`ar-${item.id}`} className="cursor-pointer flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {item.icon === 'square' && <Square className="h-4 w-4 text-muted-foreground" />}
                      {item.icon === 'h' && <RectangleHorizontal className="h-4 w-4 text-muted-foreground" />}
                      {item.icon === 'v' && <RectangleVertical className="h-4 w-4 text-muted-foreground" />}
                      {item.label}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Model Choice */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Square className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              生成模型
            </h3>
          </div>
          <Select value={modelChoice} onValueChange={(v) => onModelChange?.(v as ModelChoice)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择模型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flux">flux-schnell（免费）</SelectItem>
              <SelectItem value="seedream">Seedream 3.0（标准）</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
