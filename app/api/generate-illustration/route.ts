import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateIllustrationWithAI } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    // ✅ 1. 验证用户身份（临时跳过 - 开发测试用）
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // 临时允许未登录用户测试
    // if (authError || !user) {
    //   return NextResponse.json(
    //     { 
    //       success: false, 
    //       image_urls: [], 
    //       error: '请先登录' 
    //     },
    //     { status: 401 }
    //   );
    // }

    // ✅ 2. 获取请求参数
    const body = await request.json();
    const { article_text, user_tier, style_choice, aspect_ratio } = body;
    
    if (!article_text || !user_tier || !style_choice || !aspect_ratio) {
      return NextResponse.json(
        { 
          success: false, 
          image_urls: [], 
          error: '缺少必需参数' 
        },
        { status: 400 }
      );
    }

    // 验证用户等级
    if (!['free', 'standard'].includes(user_tier)) {
      return NextResponse.json(
        { 
          success: false, 
          image_urls: [], 
          error: '无效的用户等级' 
        },
        { status: 400 }
      );
    }

    // ✅ 3. 获取客户数据（临时跳过 - 开发测试用）
    let customer = null;
    if (user) {
      const { data: customerData, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .single();
      customer = customerData;
    }

    // ✅ 4. 检查并扣除积分（临时跳过 - 开发测试用）
    let actualTier: 'free' | 'standard' = user_tier as 'free' | 'standard';
    
    // 临时跳过积分和订阅检查
    console.log('临时测试模式：跳过积分检查，直接使用', actualTier);

    // ✅ 5. 调用AI服务生成插画
    const result = await generateIllustrationWithAI({
      article_text,
      user_tier: actualTier,
      style_choice,
      aspect_ratio,
    });

    if (!result.success) {
      // 如果生成失败，退还积分
      if (actualTier === 'free' && customer) {
        await supabase
          .from('customers')
          .update({
            credits: customer.credits,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      }
      
      return NextResponse.json(result, { status: 500 });
    }

    // ✅ 6. 保存生成历史到数据库（临时跳过 - 开发测试用）
    if (user) {
      await supabase
        .from('generation_history')
        .insert({
          user_id: user.id,
          article_text: article_text,
          image_urls: result.image_urls,
          images_data: result.images,
          user_tier: actualTier,
          style_choice: style_choice,
          aspect_ratio: aspect_ratio,
          created_at: new Date().toISOString(),
        });
    }

    // ✅ 7. 返回结果
    return NextResponse.json(result);

  } catch (error) {
    console.error('生成插画API错误:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        image_urls: [], 
        error: error instanceof Error ? error.message : '服务器内部错误' 
      },
      { status: 500 }
    );
  }
}
