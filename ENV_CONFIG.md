# 环境变量配置指南

## 📝 创建 .env.local 文件

在项目根目录创建 `.env.local` 文件，添加以下内容：

```env
# ==========================================
# Supabase 配置（从 Supabase Dashboard 获取）
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ==========================================
# Creem.io 支付配置（从 Creem.io Dashboard 获取）
# ==========================================
CREEM_WEBHOOK_SECRET=your_creem_webhook_secret
CREEM_API_KEY=your_creem_api_key
CREEM_API_URL=https://test-api.creem.io/v1

# ==========================================
# 站点配置
# ==========================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CREEM_SUCCESS_URL=http://localhost:3000/dashboard

# ==========================================
# AI 模型配置（新增）
# ==========================================

# OpenRouter API（用于 Gemini 2.5 Flash）
# 获取：https://openrouter.ai/
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME=Article Illustrator

# Replicate API（用于图像生成）
# 获取：https://replicate.com/
REPLICATE_API_TOKEN=your_replicate_api_token

# 模型 ID 配置（可选，使用默认值）
FLUX_MODEL_ID=black-forest-labs/flux-schnell
SEEDREAM_MODEL_ID=bytedance/seedream-3

# ==========================================
# 应用配置
# ==========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000
DEFAULT_USER_TIER=free

# ==========================================
# 安全配置
# ==========================================
API_KEY_SALT=your-random-salt-change-in-production
JWT_SECRET=your-jwt-secret-change-in-production

# ==========================================
# 日志配置
# ==========================================
LOG_LEVEL=info
DEBUG_MODE=false
```

---

## 🔑 API 密钥获取指南

### 1. OpenRouter API Key

**用途**：调用 Gemini 2.5 Flash 进行文章语义分析

**获取步骤**：
1. 访问 https://openrouter.ai/
2. 注册并登录
3. 进入 Dashboard > API Keys
4. 创建新的 API Key
5. 复制 API Key 并填入 `OPENROUTER_API_KEY`

**费用**：
- 按使用量计费
- Gemini 2.5 Flash 价格约为 $0.0001 / 1K tokens

---

### 2. Replicate API Token

**用途**：调用 FLUX Schnell 和 Seedream 3.0 生成图片

**获取步骤**：
1. 访问 https://replicate.com/
2. 注册并登录
3. 进入 Account > API Tokens
4. 创建新的 API Token
5. 复制 Token 并填入 `REPLICATE_API_TOKEN`

**费用**：
- FLUX Schnell：约 $0.003 / 次
- Seedream 3.0：约 $0.01 / 次

---

### 3. Supabase 配置（已有）

保持现有配置不变

---

### 4. Creem.io 配置（已有）

保持现有配置不变

---

## ⚙️ 可选配置说明

### 模型选择

你可以更改使用的模型：

```env
# 使用其他 FLUX 模型
FLUX_MODEL_ID=black-forest-labs/flux-dev

# 使用其他 Seedream 模型
SEEDREAM_MODEL_ID=bytedance/seedream-3-ultra
```

可用模型列表：https://replicate.com/explore

---

### 速率限制

调整 API 请求限制：

```env
# 每分钟最多 10 次请求
RATE_LIMIT_MAX_REQUESTS=10
# 时间窗口 60 秒
RATE_LIMIT_WINDOW_MS=60000
```

---

### 默认用户等级

新用户默认等级：

```env
DEFAULT_USER_TIER=free  # free 或 standard
```

---

## 🧪 测试配置

### 开发环境

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CREEM_API_URL=https://test-api.creem.io/v1
DEBUG_MODE=true
LOG_LEVEL=debug
```

### 生产环境

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
CREEM_API_URL=https://api.creem.io
DEBUG_MODE=false
LOG_LEVEL=info
```

---

## ✅ 配置检查清单

- [ ] Supabase URL 和密钥已配置
- [ ] Creem.io API Key 和 Webhook Secret 已配置
- [ ] OpenRouter API Key 已获取并配置
- [ ] Replicate API Token 已获取并配置
- [ ] 站点 URL 已正确设置
- [ ] 数据库迁移已执行
- [ ] 所有环境变量已填写完整

---

## 🐛 常见问题

### Q: OpenRouter API 调用失败
A: 检查 API Key 是否正确，账户是否有余额

### Q: Replicate 图片生成失败
A: 检查 API Token 是否正确，账户是否有余额

### Q: 环境变量未生效
A: 确保文件名为 `.env.local`，重启开发服务器

---

## 💰 成本估算

### 每次生成成本：

**免费用户（FLUX Schnell）：**
- Gemini 分析：~$0.0001
- 图片生成（3-10张）：~$0.009 - $0.03
- **总计**：约 $0.01 - $0.03 / 次

**付费用户（Seedream 3.0）：**
- Gemini 分析：~$0.0001
- 图片生成（3-10张）：~$0.03 - $0.10
- **总计**：约 $0.03 - $0.10 / 次

### 建议定价：

- **免费用户积分包**：10 次 / ¥9.9
- **付费会员**：¥99 / 月（无限次）

---

## 📞 需要帮助？

如有问题，请检查：
1. 环境变量是否正确填写
2. API 密钥是否有效
3. 账户余额是否充足
4. 数据库迁移是否成功

祝使用愉快！🎉
