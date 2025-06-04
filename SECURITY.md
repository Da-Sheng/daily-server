# 安全配置说明

## 环境变量配置

### 1. 复制环境变量模板
```bash
cp .env.example .env
```

### 2. 配置数据库连接
编辑 `.env` 文件，填入您的实际数据库配置：

```env
DATABASE_URL=libsql://your-actual-database-url.turso.io
DATABASE_AUTH_TOKEN=your-actual-database-token
```

### 3. 获取Turso数据库Token

#### 方法1：使用Turso CLI
```bash
# 安装Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# 登录
turso auth login

# 创建token
turso db tokens create your-database-name
```

#### 方法2：通过Web控制台
1. 访问 [Turso控制台](https://turso.tech/app)
2. 选择您的数据库
3. 进入 "Settings" -> "Tokens"
4. 创建新的token

## 安全注意事项

⚠️ **重要提醒**：
- 永远不要将 `.env` 文件提交到Git
- 定期轮换数据库token
- 使用最小权限原则
- 监控数据库访问日志

## 紧急情况处理

如果token泄露：
1. 立即撤销旧token
2. 生成新token
3. 更新所有部署环境
4. 检查访问日志 