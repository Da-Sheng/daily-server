#!/usr/bin/env node

/**
 * 部署准备检查脚本
 * 验证项目配置和依赖是否就绪
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 检查部署准备状态...\n');

const checks = [];

// 1. 检查必要文件
const requiredFiles = [
  'package.json',
  'wrangler.toml',
  'src/index.js',
  'src/database/models/Tool.js',
  'src/database/models/Category.js',
  'src/database/models/Ticket.js',
  'src/resolvers/resolvers.js',
  'src/schema/typeDefs.js',
  'src/database/migrations/001_create_categories_table.sql',
  'src/database/migrations/002_create_tools_table.sql',
  'src/database/migrations/003_create_tickets_table.sql'
];

console.log('📁 检查必要文件...');
let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - 文件不存在`);
    allFilesExist = false;
  }
});
checks.push({ name: '必要文件', passed: allFilesExist });

// 2. 检查 package.json 配置
console.log('\n📦 检查 package.json 配置...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasDevScript = packageJson.scripts && packageJson.scripts['dev:simple'];
  const hasDeployScript = packageJson.scripts && packageJson.scripts['deploy'];
  const hasDependencies = packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0;
  
  console.log(`   ${hasDevScript ? '✅' : '❌'} dev:simple 脚本`);
  console.log(`   ${hasDeployScript ? '✅' : '❌'} deploy 脚本`);
  console.log(`   ${hasDependencies ? '✅' : '❌'} 依赖包配置`);
  
  checks.push({ name: 'package.json配置', passed: hasDevScript && hasDeployScript && hasDependencies });
} catch (error) {
  console.log('   ❌ package.json 读取失败');
  checks.push({ name: 'package.json配置', passed: false });
}

// 3. 检查 wrangler.toml 配置
console.log('\n⚙️  检查 wrangler.toml 配置...');
try {
  const wranglerToml = fs.readFileSync('wrangler.toml', 'utf8');
  const hasName = wranglerToml.includes('name =');
  const hasCompatibilityDate = wranglerToml.includes('compatibility_date =');
  const hasDatabase = wranglerToml.includes('[[d1_databases]]');
  
  console.log(`   ${hasName ? '✅' : '❌'} 项目名称配置`);
  console.log(`   ${hasCompatibilityDate ? '✅' : '❌'} 兼容性日期配置`);
  console.log(`   ${hasDatabase ? '✅' : '❌'} D1 数据库配置`);
  
  checks.push({ name: 'wrangler.toml配置', passed: hasName && hasCompatibilityDate && hasDatabase });
} catch (error) {
  console.log('   ❌ wrangler.toml 读取失败');
  checks.push({ name: 'wrangler.toml配置', passed: false });
}

// 4. 检查数据库迁移文件
console.log('\n🗄️  检查数据库迁移文件...');
const migrationDir = 'src/database/migrations';
let migrationFiles = [];
try {
  migrationFiles = fs.readdirSync(migrationDir).filter(file => file.endsWith('.sql'));
  console.log(`   ✅ 找到 ${migrationFiles.length} 个迁移文件:`);
  migrationFiles.forEach(file => {
    console.log(`      - ${file}`);
  });
  checks.push({ name: '数据库迁移文件', passed: migrationFiles.length >= 3 });
} catch (error) {
  console.log('   ❌ 迁移文件目录不存在');
  checks.push({ name: '数据库迁移文件', passed: false });
}

// 5. 检查 GraphQL 配置
console.log('\n🔍 检查 GraphQL 配置...');
try {
  const indexJs = fs.readFileSync('src/index.js', 'utf8');
  const resolversJs = fs.readFileSync('src/resolvers/resolvers.js', 'utf8');
  const typeDefsJs = fs.readFileSync('src/schema/typeDefs.js', 'utf8');
  
  const hasApolloServer = indexJs.includes('ApolloServer');
  const hasResolvers = resolversJs.includes('resolvers') && resolversJs.includes('export');
  const hasTypeDefs = typeDefsJs.includes('typeDefs') && typeDefsJs.includes('export');
  
  console.log(`   ${hasApolloServer ? '✅' : '❌'} Apollo Server 配置`);
  console.log(`   ${hasResolvers ? '✅' : '❌'} GraphQL Resolvers`);
  console.log(`   ${hasTypeDefs ? '✅' : '❌'} GraphQL TypeDefs`);
  
  checks.push({ name: 'GraphQL配置', passed: hasApolloServer && hasResolvers && hasTypeDefs });
} catch (error) {
  console.log('   ❌ GraphQL 配置文件读取失败');
  checks.push({ name: 'GraphQL配置', passed: false });
}

// 6. 检查模型文件
console.log('\n🏗️  检查数据模型...');
const modelFiles = ['Tool.js', 'Category.js', 'Ticket.js'];
let allModelsExist = true;
modelFiles.forEach(file => {
  const filePath = `src/database/models/${file}`;
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const hasExport = content.includes('export') || content.includes('module.exports');
      console.log(`   ${hasExport ? '✅' : '❌'} ${file} - ${hasExport ? '有导出' : '缺少导出'}`);
      if (!hasExport) allModelsExist = false;
    } catch (error) {
      console.log(`   ❌ ${file} - 读取失败`);
      allModelsExist = false;
    }
  } else {
    console.log(`   ❌ ${file} - 文件不存在`);
    allModelsExist = false;
  }
});
checks.push({ name: '数据模型', passed: allModelsExist });

// 7. 生成报告
console.log('\n📊 检查结果汇总:');
console.log('=' .repeat(50));

let allPassed = true;
checks.forEach(check => {
  const status = check.passed ? '✅ 通过' : '❌ 失败';
  console.log(`${check.name.padEnd(20)} ${status}`);
  if (!check.passed) allPassed = false;
});

console.log('=' .repeat(50));

if (allPassed) {
  console.log('\n🎉 所有检查通过！项目已准备好部署。');
  console.log('\n📋 部署步骤:');
  console.log('1. 确保已登录 Cloudflare: pnpm exec wrangler login');
  console.log('2. 设置数据库令牌: pnpm exec wrangler secret put DATABASE_AUTH_TOKEN');
  console.log('3. 部署到生产环境: npm run deploy');
  console.log('\n🚀 开始部署吧！');
} else {
  console.log('\n⚠️  有检查项未通过，请修复后再部署。');
  process.exit(1);
}

// 8. 显示项目功能总结
console.log('\n🎯 项目功能总结:');
console.log('- ✅ 工具管理 (Tools): 创建、查询、分类筛选');
console.log('- ✅ 分类管理 (Categories): 分类创建、查询');
console.log('- ✅ 票务系统 (Tickets): 票务创建、购买、统计、搜索');
console.log('- ✅ GraphQL API: 完整的查询和变更接口');
console.log('- ✅ 数据库: SQLite D1 数据库支持');
console.log('- ✅ 部署: Cloudflare Workers 部署');

console.log('\n📚 测试命令:');
console.log('- 本地开发: npm run dev:simple');
console.log('- 票务测试: node test-tickets.js');
console.log('- 部署检查: node deploy-check.js'); 