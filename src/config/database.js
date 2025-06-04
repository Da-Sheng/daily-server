import { createClient } from '@libsql/client';

/**
 * 数据库配置
 */
const DATABASE_CONFIG = {
  // Turso数据库URL (需要替换为您的实际URL)
  url: 'libsql://jjticket-kuang-sheng.aws-us-east-1.turso.io',
  // Turso数据库认证Token
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiI2NjU5NjU3Zi02M2IyLTQ2Y2YtYTc2Mi04NTlmZjg1ZGY4MmYiLCJpYXQiOjE3NDkwMTc5NTAsInJpZCI6IjQwODdmODkxLWM3NGUtNDA4NC05MjNlLTE0ZjEzMTE5ZmE3MSJ9.57dYwFptk0zAfRNxUmwVVkpPO8wKVFntwwYDzoKeMb10GNuT85hDGVMGu3murMHHQQvdIiiZ8hAEg2ZW_OXkCQ'
};

/**
 * 创建数据库客户端实例
 */
export const createDBClient = () => {
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
export const getDBClient = () => {
  if (!dbClient) {
    dbClient = createDBClient();
  }
  return dbClient;
};

/**
 * 测试数据库连接
 */
export const testConnection = async () => {
  try {
    const client = getDBClient();
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