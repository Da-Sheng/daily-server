# 每日工具 GraphQL API 服务

这个项目是一个基于Cloudflare Workers的GraphQL API服务，提供各种工具的分类和详细信息。

## 功能特点

- 使用GraphQL API提供统一的查询接口
- 部署在Cloudflare Workers上，全球边缘网络加速
- 提供工具分类、工具详情的查询能力
- 支持关联查询，如查询某分类下的所有工具

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
