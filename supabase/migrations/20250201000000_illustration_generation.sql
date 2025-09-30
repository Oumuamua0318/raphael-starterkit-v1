-- AI 文章配图生成历史表
CREATE TABLE IF NOT EXISTS generation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_text TEXT NOT NULL,
  image_urls TEXT[] NOT NULL,
  images_data JSONB,
  user_tier TEXT NOT NULL CHECK (user_tier IN ('free', 'standard')),
  style_choice TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以优化查询
CREATE INDEX IF NOT EXISTS idx_generation_history_user_id ON generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_created_at ON generation_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_history_user_tier ON generation_history(user_tier);

-- 启用 Row Level Security (RLS)
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户只能查看自己的生成历史
CREATE POLICY "用户可以查看自己的生成历史"
  ON generation_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS 策略：用户可以插入自己的生成历史
CREATE POLICY "用户可以插入自己的生成历史"
  ON generation_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS 策略：用户可以删除自己的生成历史
CREATE POLICY "用户可以删除自己的生成历史"
  ON generation_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- 添加注释
COMMENT ON TABLE generation_history IS 'AI 文章配图生成历史记录';
COMMENT ON COLUMN generation_history.article_text IS '用户输入的文章原文';
COMMENT ON COLUMN generation_history.image_urls IS '生成的图片URL数组';
COMMENT ON COLUMN generation_history.images_data IS '完整的图片数据（包含原文和提示词）';
COMMENT ON COLUMN generation_history.user_tier IS '用户等级（free/standard）';
COMMENT ON COLUMN generation_history.style_choice IS '选择的图片风格';
COMMENT ON COLUMN generation_history.aspect_ratio IS '选择的图片比例';
