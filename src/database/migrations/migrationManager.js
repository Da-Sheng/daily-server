import { getDBClient } from '../../config/database.js';

// 检查是否在Cloudflare Workers环境中
const isWorkerEnvironment = typeof importScripts === 'function' || 
                           typeof WorkerGlobalScope !== 'undefined' ||
                           typeof process === 'undefined';

// 只在非Workers环境中导入文件系统模块
let readFileSync, join, dirname, fileURLToPath;
if (!isWorkerEnvironment) {
  try {
    ({ readFileSync } = await import('fs'));
    ({ join, dirname } = await import('path'));
    ({ fileURLToPath } = await import('url'));
  } catch (error) {
    console.warn('文件系统模块在当前环境中不可用');
  }
}

/**
 * SQL文件路径配置
 */
const SQL_PATHS = {
  schema: 'src/database/sql/schema',
  seeds: 'src/database/sql/seeds',
};

/**
 * 执行SQL文件
 */
export const executeSQLFile = async (filePath) => {
  // 在Workers环境中不支持文件操作
  if (isWorkerEnvironment) {
    throw new Error('文件操作在Cloudflare Workers环境中不支持。请使用executeCustomSQL直接执行SQL语句。');
  }

  try {
    const client = getDBClient();
    const sqlContent = readFileSync(filePath, 'utf8');
    
    // 处理SQL内容：移除注释，分割语句
    const cleanedSQL = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n');
    
    // 按分号分割SQL语句，但只在语句结尾
    const statements = cleanedSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`开始执行SQL文件: ${filePath}`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`执行SQL: ${statement.substring(0, 80)}...`);
        await client.execute(statement);
        console.log(`✓ 执行成功`);
      }
    }
    
    console.log(`✓ SQL文件执行完成: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`✗ SQL文件执行失败: ${filePath}`, error);
    throw error;
  }
};

/**
 * 执行预定义的Schema创建语句
 */
export const runSchemaSQL = async () => {
  try {
    const client = getDBClient();
    
    console.log('开始执行Schema SQL语句...');
    
    // 创建分类表
    console.log('创建categories表...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建工具表
    console.log('创建tools表...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS tools (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        path TEXT NOT NULL,
        category_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);
    
    // 创建索引
    console.log('创建索引...');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_tools_category_id ON tools(category_id)');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name)');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_tools_name ON tools(name)');
    
    console.log('✓ Schema SQL执行完成');
    return true;
  } catch (error) {
    console.error('✗ Schema SQL执行失败:', error);
    throw error;
  }
};

/**
 * 执行预定义的种子数据插入语句
 */
export const runSeedSQL = async () => {
  try {
    const client = getDBClient();
    
    console.log('开始插入种子数据...');
    
    // 插入分类数据
    console.log('插入分类数据...');
    await client.execute(`
      INSERT OR REPLACE INTO categories (id, name, icon, description) VALUES
      ('finance', '金融工具', 'bank', '各种金融相关的计算工具'),
      ('converter', '转换工具', 'swap', '各种单位、格式转换工具'),
      ('generator', '生成器', 'code', '各种内容生成工具'),
      ('daily', '日常工具', 'calendar', '日常生活常用工具')
    `);
    
    // 插入工具数据
    console.log('插入工具数据...');
    await client.execute(`
      INSERT OR REPLACE INTO tools (id, name, description, icon, path, category_id) VALUES
      ('mortgage-calculator', '房贷计算器', '计算房贷月供、总利息等信息', 'home', '/tools/mortgage-calculator', 'finance'),
      ('loan-calculator', '贷款计算器', '计算各类贷款的还款信息', 'dollar', '/tools/loan-calculator', 'finance'),
      ('unit-converter', '单位转换器', '各种单位间的转换工具', 'calculator', '/tools/unit-converter', 'converter'),
      ('date-calculator', '日期计算器', '计算日期差值、工作日等', 'calendar', '/tools/date-calculator', 'daily'),
      ('random-generator', '随机生成器', '生成随机密码、UUID等', 'key', '/tools/random-generator', 'generator')
    `);
    
    console.log('✓ 种子数据插入完成');
    return true;
  } catch (error) {
    console.error('✗ 种子数据插入失败:', error);
    throw error;
  }
};

/**
 * 执行所有Schema文件（兼容性方法）
 */
export const runSchemaFiles = async () => {
  if (isWorkerEnvironment) {
    return await runSchemaSQL();
  } else {
    try {
      const schemaFiles = [
        join(SQL_PATHS.schema, '001_create_tables.sql'),
      ];
      
      for (const file of schemaFiles) {
        await executeSQLFile(file);
      }
      
      console.log('✓ 所有Schema文件执行完成');
    } catch (error) {
      console.error('✗ Schema文件执行失败:', error);
      throw error;
    }
  }
};

/**
 * 执行所有Seed文件（兼容性方法）
 */
export const runSeedFiles = async () => {
  if (isWorkerEnvironment) {
    return await runSeedSQL();
  } else {
    try {
      const seedFiles = [
        join(SQL_PATHS.seeds, '002_init_data.sql'),
      ];
      
      for (const file of seedFiles) {
        await executeSQLFile(file);
      }
      
      console.log('✓ 所有Seed文件执行完成');
    } catch (error) {
      console.error('✗ Seed文件执行失败:', error);
      throw error;
    }
  }
};

/**
 * 完整的数据库初始化
 */
export const initializeDatabase = async () => {
  try {
    console.log('开始初始化数据库...');
    
    // 1. 执行Schema
    await runSchemaFiles();
    
    // 2. 执行Seeds
    await runSeedFiles();
    
    console.log('✓ 数据库初始化完成');
    return true;
  } catch (error) {
    console.error('✗ 数据库初始化失败:', error);
    throw error;
  }
};

/**
 * 执行自定义SQL
 */
export const executeCustomSQL = async (sql) => {
  try {
    const client = getDBClient();
    const result = await client.execute(sql);
    console.log('✓ 自定义SQL执行成功:', result);
    return result;
  } catch (error) {
    console.error('✗ 自定义SQL执行失败:', error);
    throw error;
  }
};

export default {
  executeSQLFile,
  runSchemaFiles,
  runSeedFiles,
  runSchemaSQL,
  runSeedSQL,
  initializeDatabase,
  executeCustomSQL,
}; 