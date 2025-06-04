/**
 * 环境变量配置
 * 
 * 注意：环境变量通过 package.json 中的 -r dotenv/config 在启动时加载
 */

/**
 * 获取环境变量，支持默认值
 * 在Cloudflare Workers中，env参数会从context传入
 */
export const getEnv = (key, defaultValue = null, cloudflareEnv = null) => {
  // 优先从Cloudflare Workers环境变量获取 (生产环境)
  if (cloudflareEnv && cloudflareEnv[key]) {
    return cloudflareEnv[key];
  }
  
  // 其次从process.env获取 (本地开发)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  // 临时解决方案：为开发环境提供硬编码值
  if (key === 'DATABASE_URL') {
    return defaultValue || 'libsql://jjticket-kuang-sheng.aws-us-east-1.turso.io';
  }
  
  if (key === 'DATABASE_AUTH_TOKEN') {
    // 从.env文件中读取的token (开发环境)
    return defaultValue || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiI2NjU5NjU3Zi02M2IyLTQ2Y2YtYTc2Mi04NTlmZjg1ZGY4MmYiLCJpYXQiOjE3NDkwMTk4MjcsInJpZCI6IjQwODdmODkxLWM3NGUtNDA4NC05MjNlLTE0ZjEzMTE5ZmE3MSJ9.OlRSD2Qb0xtpAJ9ka8QlmmHEqarjvTiawXz_8cQv0OfQVPkpRKJ-H9c8xvimheHE2J8cn4A2LMXwkXMggMceBg';
  }
  
  return defaultValue;
};

/**
 * 验证必需的环境变量
 */
export const validateRequiredEnvs = (requiredEnvs, cloudflareEnv = null) => {
  const missing = [];
  
  for (const envKey of requiredEnvs) {
    const value = getEnv(envKey, null, cloudflareEnv);
    if (!value) {
      missing.push(envKey);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`缺少必需的环境变量: ${missing.join(', ')}`);
  }
};

export default {
  getEnv,
  validateRequiredEnvs
}; 