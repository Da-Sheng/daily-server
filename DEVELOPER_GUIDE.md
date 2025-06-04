# 票务系统开发者指南

## 🎯 系统概览

票务系统是一个基于 GraphQL 的票务管理平台，采用现代化的技术栈构建，支持票务创建、查询、购买和管理等核心功能。

### 核心技术栈
- **后端框架**: Cloudflare Workers + Hono
- **GraphQL**: Apollo Server
- **数据库**: SQLite (Cloudflare D1)
- **身份认证**: JWT (计划支持)
- **部署平台**: Cloudflare Workers

## 🏗️ 系统架构

```
票务系统
├── 客户端层 (GraphQL API)
├── 业务逻辑层 (Resolvers)
├── 数据访问层 (Models)
└── 数据存储层 (SQLite D1)
```

### 目录结构
```
src/
├── database/
│   ├── migrations/         # 数据库迁移文件
│   ├── models/            # 数据模型
│   └── seeds/             # 数据种子文件
├── schema/                # GraphQL 模式定义
├── resolvers/             # GraphQL 解析器
├── utils/                 # 工具函数
└── index.js              # 应用入口
```

## 🚀 快速开始

### 1. 环境准备
```bash
# 安装依赖
npm install

# 创建本地数据库
npm run db:create

# 运行数据库迁移
npm run db:migrate

# 启动开发服务器
npm run dev
```

### 2. 测试API
```bash
# 运行测试脚本
node test-tickets.js

# 部署检查
node deploy-check.js
```

## 📊 数据模型

### Ticket (票务)
```sql
CREATE TABLE tickets (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  uni256 TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  venue TEXT,
  category TEXT,
  price REAL DEFAULT 0,
  total_quantity INTEGER DEFAULT 0,
  available_quantity INTEGER DEFAULT 0,
  sold_quantity INTEGER DEFAULT 0,
  -- 更多字段...
);
```

### 关键字段说明：
- `uni256`: 唯一标识符，用于外部引用
- `available_quantity`: 可售票数，支持超售管理
- `sold_quantity`: 已售票数，实时更新
- `is_released`: 发布状态，控制票务可见性

## 🔧 核心功能实现

### 1. 票务创建
```javascript
// 业务逻辑：src/database/models/Ticket.js
async create(ticketData) {
  const mappedData = {
    title: ticketData.title,
    total_quantity: ticketData.totalQuantity,
    available_quantity: ticketData.availableQuantity || ticketData.totalQuantity,
    // 字段映射处理...
  };
  
  return await this.database.prepare(sql).bind(...values).run();
}
```

### 2. 票务购买
```javascript
async purchaseTicket(uni256, quantity = 1) {
  // 库存检查
  if (ticket.available_quantity < quantity) {
    throw new Error('库存不足');
  }
  
  // 更新库存
  const updateSql = `
    UPDATE tickets 
    SET available_quantity = available_quantity - ?, 
        sold_quantity = sold_quantity + ?
    WHERE uni256 = ?
  `;
}
```

### 3. 状态管理
```javascript
// 自动状态更新触发器
CREATE TRIGGER update_ticket_status 
AFTER UPDATE ON tickets
FOR EACH ROW
BEGIN
  UPDATE tickets SET
    is_sold_out = CASE WHEN NEW.available_quantity <= 0 THEN 1 ELSE 0 END,
    is_expired = CASE WHEN NEW.end_time < datetime('now') THEN 1 ELSE 0 END
  WHERE id = NEW.id;
END;
```

## 🔍 GraphQL 接口设计

### Query 解析器
```javascript
// src/resolvers/Query.js
const Query = {
  tickets: async (parent, args, context) => {
    return await context.models.Ticket.findAll();
  },
  
  ticket: async (parent, { uni256 }, context) => {
    return await context.models.Ticket.findByUni256(uni256);
  },
  
  availableTickets: async (parent, args, context) => {
    return await context.models.Ticket.findAvailable();
  }
};
```

### Mutation 解析器
```javascript
// src/resolvers/Mutation.js
const Mutation = {
  createTicket: async (parent, { input }, context) => {
    return await context.models.Ticket.create(input);
  },
  
  purchaseTicket: async (parent, { uni256, quantity }, context) => {
    return await context.models.Ticket.purchase(uni256, quantity);
  }
};
```

## 🛠️ 开发最佳实践

### 1. 代码规范
- 使用 ESLint 和 Prettier 保持代码风格一致
- 函数命名采用驼峰式，数据库字段采用蛇形命名
- 异步操作必须使用 async/await

### 2. 错误处理
```javascript
try {
  const result = await ticketModel.create(ticketData);
  return result;
} catch (error) {
  console.error('票务创建失败:', error);
  throw new Error(`创建失败: ${error.message}`);
}
```

### 3. 数据验证
```javascript
// 输入验证示例
if (!ticketData.title || ticketData.title.trim() === '') {
  throw new Error('票务标题不能为空');
}

if (ticketData.totalQuantity < 0) {
  throw new Error('票务数量不能为负数');
}
```

### 4. 性能优化
```sql
-- 添加索引优化查询性能
CREATE INDEX idx_tickets_uni256 ON tickets(uni256);
CREATE INDEX idx_tickets_category ON tickets(category);
CREATE INDEX idx_tickets_start_time ON tickets(start_time);
```

## 🧪 测试策略

### 1. 单元测试
```javascript
// 测试票务创建
describe('Ticket Creation', () => {
  it('should create ticket successfully', async () => {
    const ticketData = {
      title: '测试票务',
      price: 100,
      totalQuantity: 50
    };
    
    const result = await ticketModel.create(ticketData);
    expect(result.title).toBe('测试票务');
  });
});
```

### 2. 集成测试
```javascript
// 测试完整购买流程
describe('Purchase Flow', () => {
  it('should handle complete purchase process', async () => {
    // 1. 创建票务
    const ticket = await createTestTicket();
    
    // 2. 购买票务
    const purchaseResult = await purchaseTicket(ticket.uni256, 5);
    
    // 3. 验证库存更新
    expect(purchaseResult.availableQuantity).toBe(45);
  });
});
```

## 📈 监控和调试

### 1. 日志记录
```javascript
// 结构化日志
const log = {
  level: 'info',
  message: '票务购买成功',
  ticketId: ticket.id,
  quantity: quantity,
  timestamp: new Date().toISOString()
};

console.log(JSON.stringify(log));
```

### 2. 性能监控
```javascript
// API 响应时间监控
const startTime = Date.now();
const result = await processTicketPurchase();
const duration = Date.now() - startTime;

if (duration > 1000) {
  console.warn(`API响应时间过长: ${duration}ms`);
}
```

## 🔐 安全考虑

### 1. 输入验证
```javascript
// 防止 SQL 注入
const query = db.prepare('SELECT * FROM tickets WHERE uni256 = ?');
const result = query.get(uni256);
```

### 2. 权限控制
```javascript
// JWT 令牌验证
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('无效的访问令牌');
  }
};
```

## 🚀 部署和运维

### 1. 环境配置
```toml
# wrangler.toml
name = "ticket-system"
compatibility_date = "2023-10-30"

[[d1_databases]]
binding = "DB"
database_name = "ticket-system-db"
database_id = "your-database-id"
```

### 2. CI/CD 流程
```yaml
# GitHub Actions 示例
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Cloudflare Workers
        run: npx wrangler publish
```

## 📚 学习资源

### 官方文档
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [GraphQL](https://graphql.org/learn/)

### 推荐阅读
- GraphQL 设计原则
- 数据库设计最佳实践
- API 安全指南

## 🤝 贡献指南

1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码审查清单
- [ ] 代码符合项目规范
- [ ] 包含必要的测试用例
- [ ] 文档已更新
- [ ] 没有破坏现有功能

## 📞 技术支持

- 技术问题：创建 GitHub Issue
- 功能建议：通过 Discussions 讨论
- 紧急问题：联系维护团队

---

**Happy Coding! 🎉** 