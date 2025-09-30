'use client'

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ArticleInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function ArticleInput({ value, onChange, className }: ArticleInputProps) {
  const MAX_CHARS = 5000;
  const charCount = value.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isNearLimit = charCount > MAX_CHARS * 0.8;

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            文章内容
          </h3>
          <div className={`text-sm font-medium ${
            isOverLimit ? 'text-destructive' : 
            isNearLimit ? 'text-yellow-600' : 
            'text-muted-foreground'
          }`}>
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </div>
        </div>

        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="请粘贴您的文章内容..."
          className={`min-h-[400px] resize-none bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/25 ${
            isOverLimit ? 'border-destructive/50 focus:border-destructive focus:ring-destructive/25' : ''
          }`}
        />

        {isOverLimit && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">
              文章字数超出限制，请删减至 {MAX_CHARS.toLocaleString()} 字以内
            </p>
          </div>
        )}

        {isNearLimit && !isOverLimit && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-600">
              接近字数限制，还剩 {(MAX_CHARS - charCount).toLocaleString()} 字
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
