# 每日工具 GraphQL API 服务

这是一个使用Cloudflare Workers部署的GraphQL API服务，提供工具和分类数据。

## 最新更新

项目现已整合OpenAI API，实现了动态数据生成。静态数据源已被替换为通过GPT-3.5动态生成的数据，保持相同的数据结构和查询接口。

### 主要变更

1. 添加了OpenAI API集成，使用ChatAnywhere的API转发服务访问GPT-3.5
2. 引入缓存机制，减少API调用频率
3. 保留原始静态数据作为备份，当API调用失败时使用
4. 所有解析器已更新为异步函数，支持动态数据获取
5. 添加了`node-fetch`依赖，用于发送API请求
6. 添加了`"type": "module"`到package.json，确保ESM支持

### 配置说明

OpenAI API密钥配置在 `src/data/toolsData.js` 文件中：

```js
// OpenAI API配置
const OPENAI_API_KEY = 'sk-FJjismr3hW3LOju6GcWu1OdtWnhmuHNDyS6oFNbc35Ut4qWw';
const OPENAI_API_BASE_URL = 'https://api.chatanywhere.tech/v1/chat/completions';
```

如需更换API密钥或修改基础URL，请编辑此处。

### 缓存机制

为避免频繁调用API并提高性能，系统实现了简单的内存缓存机制：

```js
const cache = {
  categories: null,
  tools: null,
  lastFetched: 0,
  expiryTime: 24 * 60 * 60 * 1000 // 24小时缓存
};
```

如需调整缓存时间，可修改`expiryTime`值。

## 功能特点

- 使用GraphQL API提供统一的查询接口
- 部署在Cloudflare Workers上，全球边缘网络加速
- 提供工具分类、工具详情的查询能力
- 支持关联查询，如查询某分类下的所有工具
- 使用OpenAI API动态生成工具和分类数据

## 开发环境

### 前置条件

- Node.js 14+
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare账号

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

### 部署

```bash
npm run deploy
```

## GraphQL API 示例

### 查询所有分类

```graphql
{
  categories {
    id
    name
    description
    icon
  }
}
```

### 查询特定工具

```graphql
{
  tool(id: "mortgage-calculator") {
    name
    description
    icon
    path
    category {
      name
    }
  }
}
```

### 查询特定分类及其下的工具

```graphql
{
  category(id: "finance") {
    name
    description
    tools {
      id
      name
      description
    }
  }
}
```

## 项目结构

```
src/
├── data/         # 数据源
├── resolvers/    # GraphQL解析器
├── types/        # GraphQL类型定义
└── index.js      # 主入口文件
```
