// AI 服务 - 文章配图生成

export interface GenerateIllustrationRequest {
  article_text: string;
  user_tier: 'free' | 'standard';
  style_choice: string;
  aspect_ratio: string;
}

export interface GenerateIllustrationResponse {
  success: boolean;
  image_urls: string[];
  error?: string;
  images?: Array<{
    url: string;
    original_text: string;
    prompt: string;
  }>;
}

export interface LLMResponse {
  consistent_prompt: string;
  segments: Array<{
    id: number;
    original_text: string;
    variable_prompt_keywords: string;
  }>;
}

// 关键提示词常量
export const PROMPT_CONSTANTS = {
  FINAL_NEGATIVE_PROMPT: '--no text, no letters, no words, no signs, no chinese characters, no calligraphy, no symbols, low quality, blurred, watermark',
  PRINTING_STYLE_KEYWORDS: 'Printing Style Illustration, High Saturation, Bold Lines, Conceptual Poster Art',
} as const;

// 画风映射（中文名 -> 英文关键词）
const STYLE_KEYWORDS: Record<string, string> = {
  '真实照片': 'Photorealistic, Cinematic photography, detailed textures, professional lighting, shallow depth of field, 8k',
  '插画': 'Vibrant digital illustration, concept art, clean lines, high saturation, dynamic composition',
  '漫画': 'American comic book style, high contrast ink lines, action pose, classic panel layout, vivid colors',
  '水墨': 'Traditional Chinese ink wash painting (Shui-mo), minimalist, expressive brushstrokes, subtle gradients, atmospheric, ethereal',
  '油画': 'Masterpiece oil painting, thick impasto texture, dramatic Chiaroscuro lighting, canvas details, rich color palette',
  '素描': 'High-contrast graphite sketch, academic drawing, precise line art, chiaroscuro shading, detailed cross-hatching',
};

// LLM 系统提示词
export const LLM_SYSTEM_PROMPT = `你是一个专业的 AI 绘画提示词工程师，负责将一篇长文拆解为多个语义段落，并为每个段落生成一组高质量、视觉一致的文生图提示词。你的最终输出必须是一个严格的 JSON 对象。

**核心指令：**

### 步骤 1：生成恒定提示词 (Consistent Prompt)
1. **具象化优先：** 提取主要 **角色（人物/物体）**、**主要环境（地点/场景）** 和 **核心光影/色彩基调**。
2. **抽象化保底（鲁棒性）：** 如果文章是论述、说明或抒情类，缺乏明确的角色和场景，则必须从文章的 **核心主题或情绪** 中，提炼出一个**具有画面感的比喻或意象**作为视觉锚点。
3. **负面约束（关键）：** 必须在提示词的最后强调 **强力禁止** 画面中出现任何文字或文本符号。
4. 请将这个提炼出的、贯穿始终的提示词存入 JSON 的 **\`consistent_prompt\`** 字段中。

### 步骤 2:分段并生成变化提示词 (Variable Prompts)
1. **分段原则（语义优先）：** 必须严格根据文章的**语义逻辑、情绪转折或核心意象的变化**进行分段。
   - **最小要求：** 分段数量必须**至少为 3 个**，以确保系列图片的价值感。
   - **最大限制：** 分段数量**不超过 10 个**。
   - **判断标准：** **信息密度和语义转折点优先于字数。** 即使文章短小，若意象复杂（如诗歌），也应按语义变化点提炼 4-6 个分段。
2. 为每一个分段生成一组 **3-5 个关键词**作为 **\`variable_prompt_keywords\`**。
3. 这些关键词必须精准描述该段落特有的 **动作、局部细节或局部情绪变化**。
4. **严格排除：** 这些关键词**不得重复**步骤 1 中已包含的恒定元素。

### 步骤 3：最终输出格式
请严格按照以下 JSON 结构输出，**不允许**有任何额外的解释、Markdown 代码块外的文本或任何格式差异。

\`\`\`json
{
    "consistent_prompt": "[这里放入步骤 1 生成的恒定提示词，并包含否定词：例如：一位侦探站在迷雾中的图书馆，电影级光线。 --no text, no letters, no words, no signatures]",
    "segments": [
        {
            "id": 1,
            "original_text": "[文章的第一个语义段落原文]",
            "variable_prompt_keywords": "[该段落特有的关键词，例如：他俯身查阅一本古籍，微弱的光线照亮了泛黄的书页。]"
        }
        // ... (最少 3 个，最多 10 个 segments)
    ]
}
\`\`\``;

// 调用 OpenRouter 的 Gemini 2.5 Flash 生成提示词（服务端）
async function callGeminiLLM(articleText: string): Promise<LLMResponse> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || '',
      'X-Title': 'Article Illustrator',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-preview-09-2025',
      messages: [
        { role: 'system', content: LLM_SYSTEM_PROMPT },
        { role: 'user', content: [{ type: 'text', text: articleText }] },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini 请求失败: ${response.status} ${errText}`);
  }

  const data: any = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Gemini 返回为空');
  }

  let parsed: LLMResponse | null = null;
  try {
    parsed = typeof content === 'string' ? JSON.parse(content) : JSON.parse(content[0]?.text || '{}');
  } catch (e) {
    throw new Error('Gemini 返回的内容不是有效 JSON');
  }

  if (!parsed?.consistent_prompt || !Array.isArray(parsed?.segments)) {
    throw new Error('Gemini 返回 JSON 结构不符合预期');
  }

  return parsed;
}

// 调用文生图模型
async function generateImages(
  consistentPrompt: string,
  segments: LLMResponse['segments'],
  userTier: 'free' | 'standard',
  styleChoice: string,
  aspectRatio: string
): Promise<Array<{ url: string; original_text: string; prompt: string }>> {
  const outputs: Array<{ url: string; original_text: string; prompt: string }> = [];

  const getDims = (ratio: string): { width: number; height: number } => {
    switch (ratio) {
      case '16:9': return { width: 1152, height: 648 };
      case '9:16': return { width: 648, height: 1152 };
      case '4:3': return { width: 1024, height: 768 };
      case '3:4': return { width: 768, height: 1024 };
      case '3:2': return { width: 1152, height: 768 };
      case '2:3': return { width: 768, height: 1152 };
      case '1:1':
      default: return { width: 1024, height: 1024 };
    }
  };

  const { width, height } = getDims(aspectRatio);
  const FLUX_MODEL_ID = process.env.FLUX_MODEL_ID || 'black-forest-labs/flux-schnell';
  const SEEDREAM_MODEL_ID = process.env.SEEDREAM_MODEL_ID || 'bytedance/seedream-3';

  for (const segment of segments) {
    let finalPrompt = consistentPrompt;
    finalPrompt += `, ${segment.variable_prompt_keywords}`;
    
    const mapped = STYLE_KEYWORDS[styleChoice];
    if (mapped) finalPrompt += `, ${mapped}`;
    
    if (userTier === 'free') {
      const predictionRes = await fetch(
        `https://api.replicate.com/v1/models/${FLUX_MODEL_ID}/predictions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
            Prefer: 'wait',
          },
          body: JSON.stringify({
            input: {
              prompt: finalPrompt,
              aspect_ratio: aspectRatio,
            },
          }),
        }
      );

      let prediction: any | null = null;
      let rawFlux = await predictionRes.text();
      if (predictionRes.ok) {
        try {
          prediction = JSON.parse(rawFlux);
        } catch {
          prediction = null;
        }
      }
      
      if (!prediction) {
        const retryRes = await fetch(
          `https://api.replicate.com/v1/models/${FLUX_MODEL_ID}/predictions`,
          {
            method: 'POST',
            headers: {
              Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
              'Content-Type': 'application/json',
              Prefer: 'wait',
            },
            body: JSON.stringify({
              input: {
                prompt: finalPrompt,
                width,
                height,
              },
            }),
          }
        );
        const rawRetry = await retryRes.text();
        if (!retryRes.ok) {
          throw new Error(`flux-schnell 请求失败: ${retryRes.status} ${rawRetry.slice(0, 200)}`);
        }
        try {
          prediction = JSON.parse(rawRetry);
        } catch {
          throw new Error(`flux-schnell 返回非 JSON: ${rawRetry.slice(0, 200)}`);
        }
      }
      
      const outputUrl: string | undefined = Array.isArray(prediction?.output)
        ? prediction.output[0]
        : prediction?.output;
      if (!outputUrl) {
        throw new Error('flux-schnell 返回无输出');
      }
      outputs.push({ url: outputUrl, original_text: segment.original_text, prompt: finalPrompt });
    } else {
      const predictionRes = await fetch(
        `https://api.replicate.com/v1/models/${SEEDREAM_MODEL_ID}/predictions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
            Prefer: 'wait',
          },
          body: JSON.stringify({
            input: {
              prompt: finalPrompt,
              width,
              height,
            },
          }),
        }
      );

      if (!predictionRes.ok) {
        const t = await predictionRes.text();
        throw new Error(`seedream-3 请求失败: ${predictionRes.status} ${t}`);
      }

      const rawSeedream = await predictionRes.text();
      let prediction: any;
      try {
        prediction = JSON.parse(rawSeedream);
      } catch {
        throw new Error(`seedream-3 返回非 JSON: ${rawSeedream.slice(0, 200)}`);
      }
      
      const outputUrl: string | undefined = Array.isArray(prediction?.output)
        ? prediction.output[0]
        : prediction?.output;
      if (!outputUrl) {
        throw new Error('seedream-3 返回无输出');
      }
      outputs.push({ url: outputUrl, original_text: segment.original_text, prompt: finalPrompt });
    }
  }
  
  return outputs;
}

// 主服务函数
export async function generateIllustrationWithAI(
  request: GenerateIllustrationRequest
): Promise<GenerateIllustrationResponse> {
  try {
    console.log('开始生成插画系列:', {
      articleLength: request.article_text.length,
      userTier: request.user_tier,
      styleChoice: request.style_choice,
      aspectRatio: request.aspect_ratio
    });

    const llmResponse = await callGeminiLLM(request.article_text);
    const images = await generateImages(
      llmResponse.consistent_prompt,
      llmResponse.segments,
      request.user_tier,
      request.style_choice,
      request.aspect_ratio
    );

    return {
      success: true,
      image_urls: images.map(i => i.url),
      images,
    };

  } catch (error) {
    console.error('AI服务错误:', error);
    return {
      success: false,
      image_urls: [],
      error: error instanceof Error ? error.message : 'AI服务处理失败',
    };
  }
}
