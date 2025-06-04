import { createClient } from '@libsql/client';
import { getEnv, validateRequiredEnvs } from './env.js';

/**
 * 创建数据库客户端实例
 */
export const createDBClient = (cloudflareEnv = null) => {
  // 在创建客户端时验证必需的环境变量
  validateRequiredEnvs(['DATABASE_AUTH_TOKEN'], cloudflareEnv);
  
  const DATABASE_CONFIG = {
    // 从环境变量获取数据库URL
    url: getEnv('DATABASE_URL', 'libsql://jjticket-kuang-sheng.aws-us-east-1.turso.io', cloudflareEnv),
    // 从环境变量获取数据库认证Token
    authToken: getEnv('DATABASE_AUTH_TOKEN', null, cloudflareEnv)
  };
  
  return createClient({
    url: DATABASE_CONFIG.url,
    authToken: DATABASE_CONFIG.authToken,
  });
};

/**
 * 单例数据库客户端
 */
let dbClient = null;

/**
 * 获取数据库客户端实例
 */
export const getDBClient = (cloudflareEnv = null) => {
  if (!dbClient) {
    dbClient = createDBClient(cloudflareEnv);
  }
  return dbClient;
};

/**
 * 测试数据库连接
 */
export const testConnection = async (cloudflareEnv = null) => {
  try {
    const client = getDBClient(cloudflareEnv);
    const result = await client.execute('SELECT 1 as test');
    console.log('数据库连接测试成功:', result);
    return true;
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    return false;
  }
};

export default {
  createDBClient,
  getDBClient,
  testConnection,
}; 