#!/usr/bin/env node

/**
 * 数据库管理工具
 * 提供命令行操作数据库的工具
 */

import { databaseService } from '../services/DatabaseService.js';
import { executeCustomSQL } from '../migrations/migrationManager.js';
import { testConnection } from '../../config/database.js';

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
数据库管理工具 - 使用说明

命令列表:
  help           - 显示此帮助信息
  test           - 测试数据库连接
  init           - 初始化数据库（创建表和插入初始数据）
  stats          - 显示数据库统计信息
  list-categories - 列出所有分类
  list-tools     - 列出所有工具
  search <关键词> - 搜索工具
  sql <SQL语句>  - 执行自定义SQL语句

使用示例:
  node dbManager.js test
  node dbManager.js init
  node dbManager.js stats
  node dbManager.js search "计算"
  node dbManager.js sql "SELECT COUNT(*) FROM tools"
  `);
}

/**
 * 测试数据库连接
 */
async function testDB() {
  console.log('正在测试数据库连接...');
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      console.log('✓ 数据库连接成功');
    } else {
      console.log('✗ 数据库连接失败');
    }
  } catch (error) {
    console.error('✗ 数据库连接错误:', error.message);
  }
}

/**
 * 初始化数据库
 */
async function initDB() {
  console.log('正在初始化数据库...');
  try {
    await databaseService.initialize();
    console.log('✓ 数据库初始化完成');
  } catch (error) {
    console.error('✗ 数据库初始化失败:', error.message);
  }
}

/**
 * 显示数据库统计信息
 */
async function showStats() {
  try {
    const stats = await databaseService.getStats();
    console.log('\n=== 数据库统计信息 ===');
    console.log(`分类总数: ${stats.categories.total}`);
    console.log(`工具总数: ${stats.tools.total}`);
    console.log('\n各分类工具数量:');
    stats.tools.byCategory.forEach(item => {
      console.log(`  ${item.name}: ${item.count} 个工具`);
    });
  } catch (error) {
    console.error('✗ 获取统计信息失败:', error.message);
  }
}

/**
 * 列出所有分类
 */
async function listCategories() {
  try {
    const categories = await databaseService.getAllCategories();
    console.log('\n=== 所有分类 ===');
    categories.forEach(category => {
      console.log(`ID: ${category.id}`);
      console.log(`名称: ${category.name}`);
      console.log(`图标: ${category.icon}`);
      console.log(`描述: ${category.description}`);
      console.log('---');
    });
  } catch (error) {
    console.error('✗ 获取分类失败:', error.message);
  }
}

/**
 * 列出所有工具
 */
async function listTools() {
  try {
    const tools = await databaseService.getAllTools();
    console.log('\n=== 所有工具 ===');
    tools.forEach(tool => {
      console.log(`ID: ${tool.id}`);
      console.log(`名称: ${tool.name}`);
      console.log(`描述: ${tool.description}`);
      console.log(`分类: ${tool.category_name || tool.category_id}`);
      console.log(`路径: ${tool.path}`);
      console.log('---');
    });
  } catch (error) {
    console.error('✗ 获取工具失败:', error.message);
  }
}

/**
 * 搜索工具
 */
async function searchTools(keyword) {
  if (!keyword) {
    console.log('请提供搜索关键词');
    return;
  }

  try {
    const tools = await databaseService.searchTools(keyword);
    console.log(`\n=== 搜索结果 (关键词: "${keyword}") ===`);
    if (tools.length === 0) {
      console.log('未找到匹配的工具');
    } else {
      tools.forEach(tool => {
        console.log(`ID: ${tool.id}`);
        console.log(`名称: ${tool.name}`);
        console.log(`描述: ${tool.description}`);
        console.log(`分类: ${tool.category_name || tool.category_id}`);
        console.log('---');
      });
    }
  } catch (error) {
    console.error('✗ 搜索失败:', error.message);
  }
}

/**
 * 执行自定义SQL
 */
async function executeSql(sql) {
  if (!sql) {
    console.log('请提供SQL语句');
    return;
  }

  try {
    console.log(`执行SQL: ${sql}`);
    const result = await executeCustomSQL(sql);
    console.log('✓ SQL执行成功');
    
    if (result.rows && result.rows.length > 0) {
      console.log('\n结果:');
      console.table(result.rows);
    } else {
      console.log(`影响行数: ${result.rowsAffected || 0}`);
    }
  } catch (error) {
    console.error('✗ SQL执行失败:', error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help') {
    showHelp();
    return;
  }

  switch (command) {
    case 'test':
      await testDB();
      break;
    
    case 'init':
      await initDB();
      break;
    
    case 'stats':
      await showStats();
      break;
    
    case 'list-categories':
      await listCategories();
      break;
    
    case 'list-tools':
      await listTools();
      break;
    
    case 'search':
      await searchTools(args[1]);
      break;
    
    case 'sql':
      await executeSql(args.slice(1).join(' '));
      break;
    
    default:
      console.log(`未知命令: ${command}`);
      console.log('使用 "help" 查看可用命令');
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('程序执行失败:', error);
    process.exit(1);
  });
}

export default {
  showHelp,
  testDB,
  initDB,
  showStats,
  listCategories,
  listTools,
  searchTools,
  executeSql
}; 