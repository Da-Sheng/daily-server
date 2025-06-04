# 🎫 票务系统 API 接口文档

## 📋 目录
- [API 概览](#api-概览)
- [认证授权](#认证授权)
- [数据模型](#数据模型)
- [查询接口](#查询接口)
- [变更接口](#变更接口)
- [输入参数](#输入参数)
- [错误处理](#错误处理)
- [使用示例](#使用示例)
- [状态码说明](#状态码说明)

---

## API 概览

**基础信息:**
- **协议:** GraphQL over HTTP
- **请求方式:** POST
- **接口地址:** `http://localhost:8787/graphql` (开发环境)
- **Content-Type:** `application/json`
- **字符编码:** UTF-8

**GraphQL Playground:** 
开发环境下可访问 `http://localhost:8787/graphql` 进行在线调试

---

## 认证授权

当前版本暂未实现认证机制，后续版本将支持：
- JWT Token 认证
- API Key 认证  
- OAuth 2.0

---

## 数据模型

### Ticket (票务)

```typescript
type Ticket {
  id: String!                    // 系统内部ID
  uni256: String!                // 256位唯一标识符（支持模糊查询）
  title: String!                 // 票务标题
  description: String            // 票务描述
  venue: String                  // 举办场地
  category: String!              // 票务分类
  price: Float!                  // 票价
  totalQuantity: Int!            // 总票数
  availableQuantity: Int!        // 可用票数
  soldQuantity: Int!             // 已售票数
  startTime: String!             // 开始时间 (ISO 8601格式)
  endTime: String                // 结束时间 (ISO 8601格式)
  saleStartTime: String          // 售票开始时间
  saleEndTime: String            // 售票结束时间
  isReleased: Boolean!           // 是否发布
  isExpired: Boolean!            // 是否过期
  isEnabled: Boolean!            // 是否启用
  isSoldOut: Boolean!            // 是否售罄
  organizer: String              // 主办方
  contactInfo: String            // 联系信息
  terms: String                  // 条款说明
  imageUrl: String               // 图片地址
  createdAt: String!             // 创建时间
  updatedAt: String!             // 更新时间
}
```

### TicketStats (票务统计)

```typescript
type TicketStats {
  totalTickets: Int!             // 总票务数
  releasedTickets: Int!          // 已发布票务数
  soldOutTickets: Int!           // 售罄票务数
  expiredTickets: Int!           // 过期票务数
  totalQuantity: Int!            // 总票数
  totalSold: Int!                // 总售出数
  totalAvailable: Int!           // 总可用数
}
```

---

## 查询接口

### 1. 获取所有票务

```graphql
query GetAllTickets {
  tickets {
    id
    uni256
    title
    price
    totalQuantity
    availableQuantity
    isReleased
    venue
    startTime
  }
}
```

**返回:** `[Ticket!]!`

---

### 2. 根据uni256获取票务（支持模糊匹配）

```graphql
query GetTicketByUni256($uni256: String!) {
  ticket(uni256: $uni256) {
    id
    uni256
    title
    description
    venue
    price
    totalQuantity
    availableQuantity
    startTime
    endTime
    organizer
    isReleased
    isEnabled
  }
}
```

**参数:**
- `uni256`: String! - 256位唯一标识符（支持模糊查询）

**返回:** `Ticket`

---

### 3. 根据ID获取票务

```graphql
query GetTicketById($id: String!) {
  ticketById(id: $id) {
    id
    uni256
    title
    price
    availableQuantity
  }
}
```

**参数:**
- `id`: String! - 票务ID

**返回:** `Ticket`

---

### 4. 按条件筛选票务

```graphql
query FilterTickets($filter: TicketFilterInput) {
  ticketsByFilter(filter: $filter) {
    id
    title
    description
    venue
    price
    availableQuantity
    startTime
    isReleased
  }
}
```

**参数:**
- `filter`: TicketFilterInput - 筛选条件

**返回:** `[Ticket!]!`

---

### 5. 获取可购买票务

```graphql
query GetAvailableTickets {
  availableTickets {
    id
    uni256
    title
    price
    availableQuantity
    venue
    startTime
    organizer
  }
}
```

**返回:** `[Ticket!]!` - 只返回已发布、已启用且有库存的票务

---

### 6. 获取票务统计

```graphql
query GetTicketStats {
  ticketStats {
    totalTickets
    releasedTickets
    soldOutTickets
    expiredTickets
    totalQuantity
    totalSold
    totalAvailable
  }
}
```

**返回:** `TicketStats!`

---

## 变更接口

### 1. 创建票务

```graphql
mutation CreateTicket($input: TicketInput!) {
  createTicket(input: $input) {
    id
    uni256
    title
    price
    totalQuantity
    availableQuantity
    isReleased
    createdAt
  }
}
```

**参数:**
- `input`: TicketInput! - 票务创建数据

**返回:** `Ticket!`

---

### 2. 更新票务（支持uni256模糊匹配）

```graphql
mutation UpdateTicket($uni256: String!, $input: TicketUpdateInput!) {
  updateTicket(uni256: $uni256, input: $input) {
    id
    uni256
    title
    price
    totalQuantity
    availableQuantity
    updatedAt
  }
}
```

**参数:**
- `uni256`: String! - 票务唯一标识符（支持模糊匹配）
- `input`: TicketUpdateInput! - 更新数据

**返回:** `Ticket!`

---

### 3. 删除票务（支持uni256模糊匹配）

```graphql
mutation DeleteTicket($uni256: String!) {
  deleteTicket(uni256: $uni256)
}
```

**参数:**
- `uni256`: String! - 票务唯一标识符（支持模糊匹配）

**返回:** `Boolean!`

---

### 4. 购买票务（支持uni256模糊匹配）

```graphql
mutation PurchaseTicket($uni256: String!, $quantity: Int) {
  purchaseTicket(uni256: $uni256, quantity: $quantity) {
    id
    title
    totalQuantity
    availableQuantity
    soldQuantity
    isSoldOut
  }
}
```

**参数:**
- `uni256`: String! - 票务唯一标识符（支持模糊匹配）
- `quantity`: Int - 购买数量 (默认为1)

**返回:** `Ticket!`

---

## 输入参数

### TicketInput (创建票务)

```typescript
input TicketInput {
  uni256: String                 // 可选，不提供时自动生成
  title: String!                 // 必需，票务标题
  description: String            // 可选，票务描述
  venue: String                  // 可选，举办场地
  category: String               // 可选，票务分类，默认"general"
  price: Float!                  // 必需，票价
  totalQuantity: Int!            // 必需，总票数
  availableQuantity: Int         // 可选，默认等于totalQuantity
  startTime: String!             // 必需，开始时间(ISO 8601)
  endTime: String                // 可选，结束时间
  saleStartTime: String          // 可选，售票开始时间
  saleEndTime: String            // 可选，售票结束时间
  isReleased: Boolean            // 可选，是否发布，默认false
  isExpired: Boolean             // 可选，是否过期，默认false
  isEnabled: Boolean             // 可选，是否启用，默认true
  organizer: String              // 可选，主办方
  contactInfo: String            // 可选，联系信息
  terms: String                  // 可选，条款说明
  imageUrl: String               // 可选，图片地址
}
```

### TicketUpdateInput (更新票务)

```typescript
input TicketUpdateInput {
  title: String
  description: String
  venue: String
  category: String
  price: Float
  totalQuantity: Int
  availableQuantity: Int
  startTime: String
  endTime: String
  saleStartTime: String
  saleEndTime: String
  isReleased: Boolean
  isExpired: Boolean
  isEnabled: Boolean
  organizer: String
  contactInfo: String
  terms: String
  imageUrl: String
}
```

### TicketFilterInput (筛选条件)

```typescript
input TicketFilterInput {
  keyword: String                // 关键词搜索（标题、描述、场地）
  category: String               // 按分类筛选
  isReleased: Boolean            // 按发布状态筛选
  isEnabled: Boolean             // 按启用状态筛选
  availableOnly: Boolean         // 只显示可购买的票务
  startTimeFrom: String          // 开始时间范围-起始
  startTimeTo: String            // 开始时间范围-结束
  limit: Int                     // 限制返回数量
  offset: Int                    // 分页偏移量
}
```

---

## 错误处理

### 常见错误类型

#### 1. 业务逻辑错误
```json
{
  "errors": [
    {
      "message": "票务库存不足",
      "extensions": {
        "code": "INSUFFICIENT_STOCK",
        "availableQuantity": 5,
        "requestedQuantity": 10
      }
    }
  ]
}
```

#### 2. 数据验证错误
```json
{
  "errors": [
    {
      "message": "票务标题不能为空",
      "extensions": {
        "code": "VALIDATION_ERROR",
        "field": "title"
      }
    }
  ]
}
```

#### 3. 资源不存在错误
```json
{
  "errors": [
    {
      "message": "票务不存在",
      "extensions": {
        "code": "TICKET_NOT_FOUND",
        "uni256": "abc123..."
      }
    }
  ]
}
```

### 错误码对照表

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| `TICKET_NOT_FOUND` | 票务不存在 | 检查uni256是否正确 |
| `INSUFFICIENT_STOCK` | 库存不足 | 减少购买数量或选择其他票务 |
| `TICKET_NOT_RELEASED` | 票务未发布 | 等待票务发布 |
| `TICKET_EXPIRED` | 票务已过期 | 选择其他有效票务 |
| `TICKET_DISABLED` | 票务已禁用 | 联系管理员 |
| `VALIDATION_ERROR` | 数据验证失败 | 检查输入参数 |
| `INTERNAL_ERROR` | 内部服务错误 | 稍后重试或联系技术支持 |

---

## 使用示例

### 示例1: 创建票务

```bash
curl -X POST http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation CreateTicket($input: TicketInput!) { createTicket(input: $input) { id uni256 title price totalQuantity venue organizer createdAt } }",
    "variables": {
      "input": {
        "title": "2024新年音乐会",
        "description": "著名交响乐团新年音乐会演出",
        "venue": "国家大剧院",
        "category": "concert",
        "price": 388.00,
        "totalQuantity": 500,
        "startTime": "2024-12-31T19:30:00Z",
        "endTime": "2024-12-31T22:00:00Z",
        "isReleased": true,
        "isEnabled": true,
        "organizer": "国家交响乐团"
      }
    }
  }'
```

**响应:**
```json
{
  "data": {
    "createTicket": {
      "id": "abc123def456",
      "uni256": "XYZ789ABC123...",
      "title": "2024新年音乐会",
      "price": 388,
      "totalQuantity": 500,
      "venue": "国家大剧院",
      "organizer": "国家交响乐团",
      "createdAt": "2024-06-04T12:00:00Z"
    }
  }
}
```

### 示例2: 模糊查询票务（新功能）

```bash
# 使用完整uni256
curl -X POST http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetTicket($uni256: String!) { ticket(uni256: $uni256) { id uni256 title price venue } }",
    "variables": {
      "uni256": "TICKET-1749032138919-9ZTG7JMLT0N"
    }
  }'

# 使用部分uni256（模糊匹配）
curl -X POST http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetTicket($uni256: String!) { ticket(uni256: $uni256) { id uni256 title price venue } }",
    "variables": {
      "uni256": "ticket-1749032138919"
    }
  }'

# 使用关键词匹配
curl -X POST http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetTicket($uni256: String!) { ticket(uni256: $uni256) { id uni256 title price venue } }",
    "variables": {
      "uni256": "9ztg7jmlt0n"
    }
  }'
```

### 示例3: 购买票务（支持模糊匹配）

```bash
curl -X POST http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation PurchaseTicket($uni256: String!, $quantity: Int) { purchaseTicket(uni256: $uni256, quantity: $quantity) { id title totalQuantity availableQuantity soldQuantity isSoldOut } }",
    "variables": {
      "uni256": "ticket-1749032138919",
      "quantity": 3
    }
  }'
```

**响应:**
```json
{
  "data": {
    "purchaseTicket": {
      "id": "abc123def456",
      "title": "2024新年音乐会",
      "totalQuantity": 500,
      "availableQuantity": 497,
      "soldQuantity": 3,
      "isSoldOut": false
    }
  }
}
```

### 示例4: 搜索票务

```bash
curl -X POST http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query SearchTickets($filter: TicketFilterInput) { ticketsByFilter(filter: $filter) { id title venue price availableQuantity startTime } }",
    "variables": {
      "filter": {
        "keyword": "音乐会",
        "availableOnly": true,
        "limit": 10
      }
    }
  }'
```

**响应:**
```json
{
  "data": {
    "ticketsByFilter": [
      {
        "id": "abc123def456",
        "title": "2024新年音乐会",
        "venue": "国家大剧院",
        "price": 388,
        "availableQuantity": 497,
        "startTime": "2024-12-31T19:30:00Z"
      }
    ]
  }
}
```

### 示例5: 获取票务统计

```bash
curl -X POST http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ ticketStats { totalTickets releasedTickets soldOutTickets expiredTickets totalQuantity totalSold totalAvailable } }"
  }'
```

**响应:**
```json
{
  "data": {
    "ticketStats": {
      "totalTickets": 5,
      "releasedTickets": 3,
      "soldOutTickets": 2,
      "expiredTickets": 0,
      "totalQuantity": 500,
      "totalSold": 497,
      "totalAvailable": 498
    }
  }
}
```

---

## 状态码说明

### HTTP状态码

| 状态码 | 说明 | 场景 |
|--------|------|------|
| `200` | 成功 | 正常响应 |
| `400` | 请求错误 | GraphQL语法错误、参数错误 |
| `500` | 服务器错误 | 内部错误、数据库连接失败 |

### 票务状态说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `isReleased` | Boolean | `true`: 已发布，可以被搜索和购买<br>`false`: 未发布，不对外显示 |
| `isEnabled` | Boolean | `true`: 已启用，正常状态<br>`false`: 已禁用，暂停销售 |
| `isExpired` | Boolean | `true`: 已过期，不能购买<br>`false`: 未过期，在有效期内 |
| `isSoldOut` | Boolean | `true`: 已售罄，无可用票数<br>`false`: 有库存，可以购买 |

### 业务规则

1. **可购买条件:** `isReleased = true` AND `isEnabled = true` AND `isExpired = false` AND `availableQuantity > 0`

2. **自动售罄:** 当 `availableQuantity = 0` 时，系统自动设置 `isSoldOut = true`

3. **库存计算:** `totalQuantity = availableQuantity + soldQuantity`

4. **时间格式:** 所有时间字段使用 ISO 8601 格式 (例: `2024-12-31T20:00:00Z`)

---

## 测试工具

### 1. 完整功能测试
```bash
node test-tickets.js
```

### 2. 部署准备检查  
```bash
node deploy-check.js
```

### 3. 本地开发服务器
```bash
npm run dev:simple
```

---

## 版本信息

- **当前版本:** v1.2.0
- **最后更新:** 2025-01-04
- **兼容性:** GraphQL spec 2021

---

## 联系支持

如有问题请联系技术支持或查看项目文档。

**快速链接:**
- [项目 README](./README.md)
- [票务系统说明](./TICKET_README.md)
- [部署指南](./wrangler.toml)

---

*🎫 票务系统API文档 - 为您提供完整可靠的票务服务* 