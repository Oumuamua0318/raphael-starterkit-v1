# AI 文章配图工具集成方案

## 📊 项目匹配分析

### 你的项目已有：
- ✅ 前端组件（ArticleInput, ConfigPanel, ResultDisplay 等）
- ✅ AI 核心逻辑（/api/generate-illustration）
- ✅ Gemini 2.5 Flash + FLUX.1/Seedream 3.0 集成
- ✅ shadcn/ui + Tailwind CSS（与 Starter Kit 100% 兼容）
- ✅ Next.js 14 App Router（与 Starter Kit 100% 兼容）

### 你缺少的（Starter Kit 提供）：
- ❌ 用户登录系统（Supabase Auth）
- ❌ 付费订阅系统（Creem.io）
- ❌ 积分管理系统
- ❌ 用户仪表板
- ❌ 用户数据持久化

### 完美匹配点：
✨ 你的 `user_tier` (free/standard) **完美对应** Starter Kit 的订阅系统！
✨ 你可以用积分系统控制免费用户的生成次数！

---

## 🎯 集成策略

### 阶段一：清理 Starter Kit（删除中文名字生成器）

#### 删除这些文件夹：
```bash
# 在 PowerShell 中执行
Remove-Item -Recurse -Force app/api/chinese-names
Remove-Item -Recurse -Force app/api/generation-batches
Remove-Item -Recurse -Force app/api/generation-history
Remove-Item -Recurse -Force app/api/saved-names
Remove-Item -Recurse -Force app/api/tts
Remove-Item -Recurse -Force app/api/generate-pdf
Remove-Item -Recurse -Force app/name-detail
Remove-Item -Recurse -Force app/results
Remove-Item -Recurse -Force app/product
Remove-Item -Recurse -Force app/profile/batch
Remove-Item -Recurse -Force components/product
Remove-Item -Recurse -Force utils/pdf-templates
Remove-Item -Force utils/form-storage.ts
```

---

### 阶段二：复制你的项目文件

#### 1. 复制组件到 Starter Kit
```
从你的项目：article-illustrator-main/app/components/
复制到：raphael-starterkit-v1/components/illustrator/

文件清单：
- ArticleInput.tsx
- ConfigPanel.tsx
- LoadingProgress.tsx
- PremiumModal.tsx
- ResultDisplay.tsx
```

#### 2. 复制 API 路由
```
从你的项目：article-illustrator-main/app/api/
复制到：raphael-starterkit-v1/app/api/

需要复制的：
- generate-illustration/route.ts（你的核心 API）
- 其他相关 API 文件
```

#### 3. 复制 Hooks（如果有）
```
从你的项目：article-illustrator-main/app/hooks/
复制到：raphael-starterkit-v1/hooks/
```

#### 4. 复制静态资源
```
从你的项目：article-illustrator-main/app/assets/
复制到：raphael-starterkit-v1/public/illustrator/
```

---

### 阶段三：修改首页

#### 替换 `app/page.tsx`
```typescript
"use client";

import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useCredits } from "@/hooks/use-credits";
import { useSubscription } from "@/hooks/use-subscription";
import { useToast } from "@/hooks/use-toast";

import ArticleInput from "@/components/illustrator/ArticleInput";
import ConfigPanel from "@/components/illustrator/ConfigPanel";
import LoadingProgress from "@/components/illustrator/LoadingProgress";
import ResultDisplay from "@/components/illustrator/ResultDisplay";
import PremiumModal from "@/components/illustrator/PremiumModal";

export default function Home() {
  const { user, loading: userLoading } = useUser();
  const { credits, refetchCredits } = useCredits();
  const { subscription } = useSubscription();
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  // 判断用户等级
  const getUserTier = () => {
    if (!user) return "free"; // 未登录用户
    if (subscription?.status === "active") return "standard"; // 付费订阅用户
    if (credits && credits.remaining_credits > 0) return "free"; // 有积分的免费用户
    return "free";
  };

  const handleGenerate = async (articleText: string, config: any) => {
    // 检查是否登录
    if (!user) {
      toast({
        title: "请先登录",
        description: "生成配图需要登录账户",
        variant: "destructive",
      });
      return;
    }

    // 检查积分（免费用户需要积分）
    if (getUserTier() === "free" && (!credits || credits.remaining_credits < 1)) {
      toast({
        title: "积分不足",
        description: "请购买积分或订阅会员",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-illustration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          article_text: articleText,
          user_tier: getUserTier(),
          style_choice: config.style,
          aspect_ratio: config.ratio,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setImages(data.image_urls);
        refetchCredits(); // 刷新积分显示
        toast({
          title: "生成成功",
          description: `已生成 ${data.image_urls.length} 张插图`,
        });
      } else {
        toast({
          title: "生成失败",
          description: data.error || "请稍后重试",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "网络错误",
        description: "请检查网络连接",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          AI 文章智能配图工具
        </h1>

        {/* 用户信息显示 */}
        {user && (
          <div className="mb-4 p-4 bg-card rounded-lg">
            <p>当前积分：{credits?.remaining_credits || 0}</p>
            <p>会员状态：{subscription?.status === "active" ? "会员" : "免费用户"}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <ArticleInput onGenerate={handleGenerate} isLoading={isGenerating} />
            <ConfigPanel />
          </div>

          <div>
            {isGenerating ? (
              <LoadingProgress />
            ) : (
              <ResultDisplay images={images} userTier={getUserTier()} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

### 阶段四：修改 API 路由（关键！）

#### 在你的 `app/api/generate-illustration/route.ts` 中添加：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // ✅ 1. 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }

    // ✅ 2. 获取请求参数
    const { article_text, user_tier, style_choice, aspect_ratio } = await request.json();

    // ✅ 3. 检查并扣除积分（免费用户）
    if (user_tier === "free") {
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!customer || customer.credits < 1) {
        return NextResponse.json(
          { success: false, error: "积分不足，请购买积分或订阅会员" },
          { status: 403 }
        );
      }

      // 扣除 1 个积分
      await supabase
        .from('customers')
        .update({ credits: customer.credits - 1 })
        .eq('user_id', user.id);
    }

    // ✅ 4. 检查订阅状态（付费用户）
    if (user_tier === "standard") {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!subscription) {
        return NextResponse.json(
          { success: false, error: "请先订阅会员" },
          { status: 403 }
        );
      }
    }

    // ✅ 5. 调用 Gemini 2.5 Flash 分析文章
    const llmResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash-preview",
        messages: [
          {
            role: "system",
            content: "你是专业的AI绘画提示词工程师..." // 你的 LLM 提示词
          },
          {
            role: "user",
            content: article_text
          }
        ]
      })
    });

    const llmData = await llmResponse.json();
    const { consistent_prompt, segments } = JSON.parse(llmData.choices[0].message.content);

    // ✅ 6. 调用文生图 API（根据 user_tier）
    const imageModel = user_tier === "free" ? "flux-schnell" : "seedream-3.0";
    const imageUrls: string[] = [];

    for (const segment of segments) {
      const fullPrompt = `${consistent_prompt} ${segment.variable_prompt_keywords}`;
      
      const imageResponse = await fetch(process.env.IMAGE_API_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.IMAGE_API_KEY}`,
        },
        body: JSON.stringify({
          model: imageModel,
          prompt: fullPrompt,
          aspect_ratio: aspect_ratio,
          style: style_choice,
        })
      });

      const imageData = await imageResponse.json();
      imageUrls.push(imageData.url);
    }

    // ✅ 7. 保存生成历史到数据库
    await supabase
      .from('generation_history')
      .insert({
        user_id: user.id,
        article_text: article_text,
        image_urls: imageUrls,
        user_tier: user_tier,
        created_at: new Date().toISOString(),
      });

    // ✅ 8. 返回结果
    return NextResponse.json({
      success: true,
      image_urls: imageUrls,
    });

  } catch (error) {
    console.error("生成失败:", error);
    return NextResponse.json(
      { success: false, error: "生成失败，请稍后重试" },
      { status: 500 }
    );
  }
}
```

---

### 阶段五：修改订阅配置

#### 编辑 `config/subscriptions.ts`
```typescript
export const SUBSCRIPTION_PLANS = {
  standard: {
    name: "标准会员",
    price: 99,
    priceId: "你的 Creem.io 订阅产品 ID",
    features: [
      "使用 Seedream 3.0 高级模型",
      "无限次数生成",
      "批量下载功能",
      "重试生成功能",
      "优先处理队列",
    ],
  },
};

export const CREDIT_PACKAGES = {
  small: {
    name: "10 次生成",
    credits: 10,
    price: 9.9,
    priceId: "你的 Creem.io 积分产品 ID",
  },
  medium: {
    name: "50 次生成",
    credits: 50,
    price: 39.9,
    priceId: "你的 Creem.io 积分产品 ID",
  },
  large: {
    name: "100 次生成",
    credits: 100,
    price: 69.9,
    priceId: "你的 Creem.io 积分产品 ID",
  },
};
```

---

### 阶段六：创建数据库表

#### 在 Supabase SQL 编辑器中执行：
```sql
-- 生成历史表
CREATE TABLE IF NOT EXISTS generation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_text TEXT NOT NULL,
  image_urls TEXT[] NOT NULL,
  user_tier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_generation_history_user_id ON generation_history(user_id);
CREATE INDEX idx_generation_history_created_at ON generation_history(created_at);

-- 启用 RLS
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Users can view their own generation history"
  ON generation_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generation history"
  ON generation_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

### 阶段七：修改仪表板

#### 编辑 `app/dashboard/page.tsx`，添加：
```typescript
import GenerationHistoryCard from "@/components/dashboard/generation-history-card";

// 在页面中添加
<GenerationHistoryCard />
```

#### 创建 `components/dashboard/generation-history-card.tsx`：
```typescript
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GenerationHistoryCard() {
  const [history, setHistory] = useState<any[]>([]);
  const supabase = createBrowserClient();

  useEffect(() => {
    async function fetchHistory() {
      const { data } = await supabase
        .from('generation_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      setHistory(data || []);
    }
    fetchHistory();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>生成历史</CardTitle>
      </CardHeader>
      <CardContent>
        {history.map((item) => (
          <div key={item.id} className="mb-4 p-4 border rounded">
            <p className="text-sm text-muted-foreground">
              {new Date(item.created_at).toLocaleString()}
            </p>
            <p className="mt-2">生成了 {item.image_urls.length} 张图片</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

---

## 🎨 UI 调整

### 修改关于页面
编辑 `app/about/page.tsx`，改成你的 AI 配图工具介绍。

### 修改 Logo
替换 `public/images/` 中的 Logo 文件。

### 修改导航栏
编辑 `components/header.tsx`，调整导航链接。

---

## 🔐 环境变量

在 `.env.local` 中添加你的 API 密钥：
```env
# Supabase（从 Starter Kit 继承）
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Creem.io（从 Starter Kit 继承）
CREEM_WEBHOOK_SECRET=...
CREEM_API_KEY=...
CREEM_API_URL=...

# 你的 AI API
GEMINI_API_KEY=你的 Gemini 密钥
IMAGE_API_URL=你的图像生成 API URL
IMAGE_API_KEY=你的图像生成 API 密钥
```

---

## ✅ 检查清单

- [ ] 删除中文名字生成器相关文件
- [ ] 复制你的组件到 `components/illustrator/`
- [ ] 复制你的 API 到 `app/api/generate-illustration/`
- [ ] 修改首页 `app/page.tsx`
- [ ] 在 API 中添加用户验证和积分扣除
- [ ] 创建数据库表
- [ ] 修改订阅配置
- [ ] 修改仪表板
- [ ] 添加环境变量
- [ ] 测试登录流程
- [ ] 测试免费生成（扣除积分）
- [ ] 测试付费生成（订阅会员）
- [ ] 测试支付流程

---

## 💡 关键收益

1. ✅ **用户登录系统** - 开箱即用（邮箱、Google、GitHub）
2. ✅ **付费订阅** - Creem.io 自动处理支付
3. ✅ **积分系统** - 免费用户可购买积分
4. ✅ **用户仪表板** - 查看历史、管理订阅、查看积分
5. ✅ **数据持久化** - Supabase 数据库
6. ✅ **全球支付** - 支持信用卡，适合中国商家

---

## 🤔 常见问题

**Q: 免费用户能用几次？**
A: 新用户注册送 3 个积分，用完后可购买积分包或订阅会员。

**Q: 订阅会员的优势是什么？**
A: 使用更高级的 Seedream 3.0 模型，无限次数生成，额外功能（批量下载、重试等）。

**Q: 如何区分免费用户和付费用户？**
A: 检查 `subscription.status === 'active'` 判断是否为会员。

**Q: 积分扣除在哪里处理？**
A: 在 `/api/generate-illustration` 的开头，调用 AI 之前扣除。

---

## 📞 下一步

我可以帮你：
1. 具体操作每个步骤
2. 修改和调试代码
3. 测试集成效果
4. 优化用户体验

准备好开始了吗？我建议从**阶段一：清理 Starter Kit** 开始！
