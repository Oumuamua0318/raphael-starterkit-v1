// 环境变量类型定义和验证

export interface EnvConfig {
  // AI 模型 API 密钥
  OPENROUTER_API_KEY: string;
  GEMINI_API_KEY?: string; // 可选：直连 Gemini 时使用
  // Replicate (用于 flux-schnell)
  REPLICATE_API_TOKEN: string;
  FLUX_MODEL_ID: string;
  SEEDREAM_API_KEY?: string; // 可选：如果改走官方/其他网关时使用
  SEEDREAM_API_URL?: string; // 可选
  SEEDREAM_MODEL_ID: string; // 走 Replicate 时使用
  OPENROUTER_SITE_URL?: string; // 可选：排行榜统计
  OPENROUTER_SITE_NAME?: string; // 可选：排行榜统计
  
  // 应用配置
  NEXT_PUBLIC_APP_URL: string;
  RATE_LIMIT_MAX_REQUESTS: number;
  RATE_LIMIT_WINDOW_MS: number;
  DEFAULT_USER_TIER: 'free' | 'standard';
  
  // 安全配置
  API_KEY_SALT: string;
  JWT_SECRET: string;
  
  // 日志配置
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  DEBUG_MODE: boolean;
}

// 环境变量验证函数
export function validateEnvConfig(): EnvConfig {
  const requiredEnvVars = [
    'OPENROUTER_API_KEY',
    'REPLICATE_API_TOKEN',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `缺少必需的环境变量: ${missingVars.join(', ')}\n` +
      '请检查 .env.local 文件配置'
    );
  }

  return {
    // AI 模型 API 密钥
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY!,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN!,
    FLUX_MODEL_ID: process.env.FLUX_MODEL_ID || 'black-forest-labs/flux-schnell',
    SEEDREAM_API_KEY: process.env.SEEDREAM_API_KEY,
    SEEDREAM_API_URL: process.env.SEEDREAM_API_URL,
    SEEDREAM_MODEL_ID: process.env.SEEDREAM_MODEL_ID || 'bytedance/seedream-3',
    OPENROUTER_SITE_URL: process.env.OPENROUTER_SITE_URL,
    OPENROUTER_SITE_NAME: process.env.OPENROUTER_SITE_NAME,
    
    // 应用配置
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10'),
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    DEFAULT_USER_TIER: (process.env.DEFAULT_USER_TIER as 'free' | 'standard') || 'free',
    
    // 安全配置
    API_KEY_SALT: process.env.API_KEY_SALT || 'default-salt-change-in-production',
    JWT_SECRET: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
    
    // 日志配置
    LOG_LEVEL: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
    DEBUG_MODE: process.env.DEBUG_MODE === 'true',
  };
}

// 获取环境配置实例
let envConfig: EnvConfig | null = null;

export function getEnvConfig(): EnvConfig {
  if (!envConfig) {
    envConfig = validateEnvConfig();
  }
  return envConfig;
}
