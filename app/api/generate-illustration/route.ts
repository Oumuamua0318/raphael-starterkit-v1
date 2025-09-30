import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateIllustrationWithAI } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    // ✅ 1. 验证用户身份
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { 
          success: false, 
          image_urls: [], 
          error: '请先登录' 
        },
        { status: 401 }
      );
    }

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

    // ✅ 3. 获取客户数据
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching customer:', fetchError);
      return NextResponse.json(
        { 
          success: false, 
          image_urls: [], 
          error: '无法获取用户信息' 
        },
        { status: 500 }
      );
    }

    // ✅ 4. 检查并扣除积分（免费用户）或验证订阅（付费用户）
    let actualTier: 'free' | 'standard' = 'free';
    
    if (user_tier === 'standard') {
      // 检查订阅状态
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (subscription) {
        actualTier = 'standard';
      } else {
        // 没有有效订阅，降级为免费用户
        actualTier = 'free';
      }
    }

    // 免费用户需要扣除积分
    if (actualTier === 'free') {
      const creditCost = 1; // 每次生成消耗 1 个积分
      
      if (!customer || customer.credits < creditCost) {
        return NextResponse.json(
          { 
            success: false, 
            image_urls: [], 
            error: '积分不足，请购买积分或订阅会员' 
          },
          { status: 403 }
        );
      }

      // 扣除积分
      const newCredits = customer.credits - creditCost;
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          credits: newCredits,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating credits:', updateError);
        return NextResponse.json(
          { 
            success: false, 
            image_urls: [], 
            error: '扣除积分失败' 
          },
          { status: 500 }
        );
      }

      console.log(`扣除用户 ${user.id} 的 ${creditCost} 积分，剩余: ${newCredits}`);
    }

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

    // ✅ 6. 保存生成历史到数据库
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
