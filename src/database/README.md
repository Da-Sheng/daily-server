# 数据库管理模块

这个模块提供了完整的数据库管理功能，包括连接配置、数据模型、CRUD操作和管理工具。

## 📁 目录结构

```
src/database/
├── README.md                    # 本文档
├── config/
│   └── database.js             # 数据库连接配置
├── sql/
│   ├── schema/                 # 数据库表结构文件
│   │   └── 001_create_tables.sql
│   └── seeds/                  # 初始数据文件
│       └── 002_init_data.sql
├── migrations/
│   └── migrationManager.js     # 迁移管理器
├── models/
│   ├── Category.js            # 分类模型 CRUD
│   └── Tool.js                # 工具模型 CRUD
├── services/
│   └── DatabaseService.js     # 数据库服务层
└── tools/
    └── dbManager.js           # 命令行管理工具
```

## 🚀 快速开始

### 1. 配置数据库连接

编辑 `src/config/database.js` 文件，更新您的 Turso 数据库 URL：

```javascript
const DATABASE_CONFIG = {
  url: 'libsql://your-database-name.turso.io', // 替换为您的数据库URL
  authToken: 'your-token-here'
};
```

### 2. 初始化数据库

```bash
# 测试数据库连接
node src/database/tools/dbManager.js test

# 初始化数据库（创建表和插入数据）
node src/database/tools/dbManager.js init
```

### 3. 在代码中使用

```javascript
import { databaseService } from './database/services/DatabaseService.js';

// 获取所有分类
const categories = await databaseService.getAllCategories();

// 获取特定工具
const tool = await databaseService.getToolById('mortgage-calculator');

// 搜索工具
const results = await databaseService.searchTools('计算');
```

## 🛠️ 命令行工具

数据库管理工具 (`dbManager.js`) 提供了以下命令：

### 基本操作
```bash
# 显示帮助
node src/database/tools/dbManager.js help

# 测试数据库连接
node src/database/tools/dbManager.js test

# 初始化数据库
node src/database/tools/dbManager.js init
```

### 数据查询
```bash
# 显示统计信息
node src/database/tools/dbManager.js stats

# 列出所有分类
node src/database/tools/dbManager.js list-categories

# 列出所有工具
node src/database/tools/dbManager.js list-tools

# 搜索工具
node src/database/tools/dbManager.js search "计算"
```

### 自定义SQL
```bash
# 执行自定义SQL查询
node src/database/tools/dbManager.js sql "SELECT COUNT(*) FROM tools"
node src/database/tools/dbManager.js sql "SELECT * FROM categories"
```

## 📊 数据库结构

### Categories 表
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tools 表
```sql
CREATE TABLE tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  path TEXT NOT NULL,
  category_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

## 🔧 API 接口

### CategoryModel
- `findAll()` - 获取所有分类
- `findById(id)` - 根据ID获取分类
- `create(categoryData)` - 创建新分类
- `update(id, categoryData)` - 更新分类
- `delete(id)` - 删除分类
- `getToolsCount(id)` - 获取分类下的工具数量

### ToolModel
- `findAll()` - 获取所有工具
- `findById(id)` - 根据ID获取工具
- `findByCategory(categoryId)` - 根据分类ID获取工具
- `create(toolData)` - 创建新工具
- `update(id, toolData)` - 更新工具
- `delete(id)` - 删除工具
- `search(keyword)` - 搜索工具
- `getStats()` - 获取统计信息

### DatabaseService
提供统一的服务接口，整合所有数据库操作：
- 所有 CategoryModel 和 ToolModel 的方法
- `getCategoryTree()` - 获取完整的分类-工具树结构
- `getStats()` - 获取完整的数据库统计信息

## 📝 SQL 文件管理

### Schema 文件 (`sql/schema/`)
存放数据库表结构定义文件，按版本号命名：
- `001_create_tables.sql` - 创建基础表结构

### Seeds 文件 (`sql/seeds/`)
存放初始数据文件：
- `002_init_data.sql` - 初始分类和工具数据

### 添加新的迁移文件
1. 在对应目录创建新的 SQL 文件
2. 更新 `migrationManager.js` 中的文件列表
3. 运行 `dbManager.js init` 执行迁移

## 🔒 注意事项

1. **数据库URL**: 确保在 `database.js` 中配置正确的 Turso 数据库 URL
2. **Token安全**: 不要将数据库 Token 提交到版本控制系统
3. **错误处理**: 所有数据库操作都包含错误处理和日志记录
4. **连接管理**: 使用单例模式管理数据库连接

## 🚨 故障排除

### 连接失败
1. 检查数据库 URL 和 Token 是否正确
2. 确认网络连接正常
3. 验证 Turso 数据库状态

### 初始化失败
1. 检查 SQL 文件语法是否正确
2. 确认数据库权限是否足够
3. 查看控制台错误日志

### 查询异常
1. 验证表和字段名称是否正确
2. 检查参数类型和格式
3. 查看具体的错误信息

## 📈 扩展指南

### 添加新表
1. 在 `sql/schema/` 中创建新的 SQL 文件
2. 创建对应的 Model 类
3. 在 DatabaseService 中添加相应方法
4. 更新 GraphQL Schema 和 Resolvers

### 添加新字段
1. 创建 ALTER TABLE 语句
2. 更新相关 Model 的 CRUD 操作
3. 更新 GraphQL 类型定义 