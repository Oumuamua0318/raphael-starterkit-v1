# 项目改造指南

## 🔧 如何将这个项目改造成你自己的产品

### ✅ 保留的文件（基础设施 - 不要删除）

#### 认证系统
```
app/(auth-pages)/          # 登录、注册、忘记密码页面
  ├── sign-in/
  ├── sign-up/
  ├── forgot-password/
  └── layout.tsx

app/auth/callback/         # OAuth 回调处理
app/dashboard/             # 用户仪表板
  ├── page.tsx            # 仪表板主页
  └── reset-password/     # 重置密码

middleware.ts              # 路由保护中间件
```

#### 支付和订阅系统
```
app/api/webhooks/creem/    # Creem 支付 Webhook
app/api/creem/customer-portal/  # 客户门户
app/api/credits/           # 积分管理 API

config/subscriptions.ts    # 订阅配置

components/dashboard/      # 仪表板组件
  ├── credits-balance-card.tsx
  ├── subscription-status-card.tsx
  └── subscription-portal-dialog.tsx
```

#### 核心工具和组件
```
components/ui/             # Shadcn UI 组件库（全部保留）
components/
  ├── header.tsx           # 顶部导航栏
  ├── footer.tsx           # 页脚
  ├── logo.tsx             # Logo 组件
  ├── mobile-nav.tsx       # 移动端导航
  ├── theme-switcher.tsx   # 主题切换
  ├── form-message.tsx     # 表单消息
  └── submit-button.tsx    # 提交按钮

hooks/                     # 自定义钩子（全部保留）
  ├── use-user.ts
  ├── use-subscription.ts
  ├── use-credits.ts
  └── use-toast.ts

utils/                     # 工具函数
  ├── supabase/           # Supabase 客户端（全部保留）
  ├── creem/              # Creem 工具（全部保留）
  └── utils.ts            # 通用工具

lib/utils.ts              # 库工具函数
types/                    # TypeScript 类型定义
  ├── creem.ts
  └── subscriptions.ts

app/
  ├── layout.tsx          # 根布局
  ├── globals.css         # 全局样式
  └── actions.ts          # 服务器操作
```

#### 配置文件
```
package.json
tailwind.config.ts
tsconfig.json
next.config.ts
components.json
postcss.config.js
```

---

### ❌ 需要删除的文件（中文名字生成器业务逻辑）

#### 业务 API
```
app/api/chinese-names/     # ❌ 删除 - 名字生成 API
app/api/generation-batches/ # ❌ 删除 - 生成批次管理
app/api/generation-history/ # ❌ 删除 - 生成历史
app/api/saved-names/       # ❌ 删除 - 保存的名字
app/api/tts/              # ❌ 删除 - 语音合成
app/api/generate-pdf/     # ❌ 删除 - PDF 生成
```

#### 业务页面
```
app/name-detail/          # ❌ 删除 - 名字详情页
app/results/              # ❌ 删除 - 结果展示页
app/product/              # ❌ 删除 - 产品相关页面
  ├── about/
  ├── popular-names/
  └── random-generator/

app/profile/batch/        # ❌ 删除 - 批次详情页
```

#### 业务组件
```
components/product/       # ❌ 删除 - 产品组件
  ├── generator/
  ├── popular/
  ├── pricing/
  ├── random/
  └── results/
```

#### 业务工具
```
utils/pdf-templates/      # ❌ 删除 - PDF 模板
utils/form-storage.ts     # ❌ 删除 - 表单存储（如果不需要）
```

#### 静态资源
```
public/images/chinesename-logo.png  # ❌ 替换成你的 Logo
```

---

### 🔄 需要修改的文件

#### 1. 首页 (`app/page.tsx`)
```typescript
// ❌ 删除中文名字生成器的内容
// ✅ 添加你自己的产品介绍、功能展示
```

#### 2. 用户资料页 (`app/profile/page.tsx`)
```typescript
// ❌ 删除名字生成历史相关的内容
// ✅ 保留订阅信息、积分余额等基础信息
// ✅ 添加你自己的用户数据展示
```

#### 3. 仪表板组件
```
components/dashboard/
  ├── generation-history-card.tsx  # ❌ 删除或改造
  ├── my-names-card.tsx           # ❌ 删除或改造
  ├── quick-actions-card.tsx      # 🔄 修改成你的快捷操作
```

#### 4. 配置文件
```
config/subscriptions.ts   # 🔄 修改订阅方案、积分套餐为你的产品
```

#### 5. 关于/条款页面（可选）
```
app/about/page.tsx       # 🔄 修改成你的产品介绍
app/terms/page.tsx       # 🔄 修改成你的服务条款
app/privacy/page.tsx     # 🔄 修改成你的隐私政策
```

---

### 📝 改造步骤建议

#### 第一步：清理业务逻辑
```bash
# 删除中文名字生成器相关代码
rm -rf app/api/chinese-names
rm -rf app/api/generation-batches
rm -rf app/api/generation-history
rm -rf app/api/saved-names
rm -rf app/api/tts
rm -rf app/api/generate-pdf
rm -rf app/name-detail
rm -rf app/results
rm -rf app/product
rm -rf app/profile/batch
rm -rf components/product
rm -rf utils/pdf-templates
```

#### 第二步：修改首页
- 打开 `app/page.tsx`
- 删除中文名字生成器的介绍内容
- 添加你自己的产品介绍、功能特点、使用流程

#### 第三步：修改订阅配置
- 打开 `config/subscriptions.ts`
- 修改订阅方案（价格、功能、积分）
- 修改积分套餐

#### 第四步：添加你的业务 API
```
app/api/your-product/     # 创建你的产品 API
  ├── create/
  ├── list/
  └── [id]/
```

#### 第五步：创建你的产品页面
```
app/your-product/         # 创建你的产品页面
components/your-product/  # 创建你的产品组件
```

#### 第六步：修改仪表板
- 修改 `app/dashboard/page.tsx`
- 删除或替换名字生成历史相关的组件
- 添加你的产品数据展示

#### 第七步：清理数据库迁移
```
supabase/migrations/
  # 删除中文名字相关的迁移文件
  # 添加你自己的数据表迁移
```

---

### 🎯 核心原则

1. **保留所有认证、支付、用户管理的代码** - 这是基础设施
2. **删除所有特定业务逻辑** - 中文名字生成器相关
3. **复用积分系统和订阅系统** - 只需修改配置
4. **保留 UI 组件库** - 可直接使用 shadcn/ui 组件
5. **保持项目结构** - 按照现有的文件组织方式添加你的代码

---

### 💡 实用技巧

- 使用 VS Code/Cursor 的全局搜索功能，搜索 "chinese" 或 "name" 找到所有相关代码
- 每删除一个文件，检查是否有其他文件引用它
- 先在本地测试，确保基础功能（登录、支付）正常工作
- 逐步添加你的业务逻辑，而不是一次性改太多

---

### ❓ 常见问题

**Q: 我能保留一部分中文名字生成器的代码吗？**
A: 可以！如果你的产品也需要类似的功能（如生成历史、保存记录），可以参考这些代码进行改造。

**Q: 积分系统必须保留吗？**
A: 不一定。如果你的产品不需要积分系统，可以删除相关代码。但保留它能提供更灵活的计费方式。

**Q: 数据库表怎么处理？**
A: 删除中文名字相关的迁移文件，创建你自己的数据表。保留 `customers`、`subscriptions`、`credits` 等基础表。

**Q: 我需要了解所有代码才能开始吗？**
A: 不需要！先理解认证和支付的流程，然后专注于你的业务逻辑开发即可。
