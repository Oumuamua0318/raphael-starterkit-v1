// 智能插画大师 API 调用接口
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

// API 调用函数
export async function generateIllustration(
  request: GenerateIllustrationRequest
): Promise<GenerateIllustrationResponse> {
  try {
    const response = await fetch('/api/generate-illustration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '生成插画失败');
    }

    return await response.json();
  } catch (error) {
    console.error('API调用错误:', error);
    return {
      success: false,
      image_urls: [],
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

// 用户等级常量
export const USER_TIERS = {
  FREE: 'free' as const,
  STANDARD: 'standard' as const,
} as const;

// 支持的宽高比
export const ASPECT_RATIOS = [
  '16:9',
  '9:16', 
  '1:1',
  '4:3',
  '3:4',
] as const;

// 艺术风格选项
export const ART_STYLES = [
  'Printing Style',
  'Watercolor',
  'Digital Art',
  'Oil Painting',
  'Sketch',
] as const;
