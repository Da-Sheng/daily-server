# 🎫 票务API快速参考

## 🔧 基本信息
- **端点**: `http://localhost:8787/graphql`
- **方法**: POST  
- **类型**: `application/json`

## 🔍 常用查询

### 获取所有票务
```graphql
{ tickets { id uni256 title price availableQuantity venue } }
```

### 根据uni256查询（✨ 支持模糊匹配）
```graphql
query GetTicket($uni256: String!) {
  ticket(uni256: $uni256) {
    id uni256 title price venue organizer
  }
}
```

**模糊匹配示例**:
- 完整: `"TICKET-1749032138919-9ZTG7JMLT0N"`
- 部分: `"ticket-1749032138919"` 
- 关键词: `"9ztg7jmlt0n"`

### 搜索票务
```graphql
query SearchTickets($filter: TicketFilterInput) {
  ticketsByFilter(filter: $filter) {
    id title venue price availableQuantity startTime
  }
}
```

### 获取可购买票务
```graphql
{ availableTickets { id uni256 title price availableQuantity venue } }
```

### 票务统计
```graphql
{ ticketStats { totalTickets releasedTickets totalQuantity totalSold totalAvailable } }
```

## ✏️ 常用变更

### 创建票务
```graphql
mutation CreateTicket($input: TicketInput!) {
  createTicket(input: $input) {
    id uni256 title price totalQuantity venue organizer createdAt
  }
}
```

### 购买票务（✨ 支持模糊匹配）
```graphql
mutation PurchaseTicket($uni256: String!, $quantity: Int) {
  purchaseTicket(uni256: $uni256, quantity: $quantity) {
    id title totalQuantity availableQuantity soldQuantity isSoldOut
  }
}
```

## 📝 输入示例

### 创建票务参数
```json
{
  "input": {
    "title": "2024新年音乐会",
    "description": "著名交响乐团演出",
    "venue": "国家大剧院", 
    "category": "concert",
    "price": 388.00,
    "totalQuantity": 500,
    "startTime": "2024-12-31T19:30:00Z",
    "isReleased": true,
    "organizer": "国家交响乐团"
  }
}
```

### 搜索筛选参数
```json
{
  "filter": {
    "keyword": "音乐会",
    "category": "concert", 
    "availableOnly": true,
    "startTimeFrom": "2024-12-01T00:00:00Z",
    "limit": 10,
    "offset": 0
  }
}
```

## 🚫 常见错误

| 错误信息 | 原因 | 解决方案 |
|---------|------|----------|
| 票务不存在 | uni256无匹配记录 | 检查uni256参数，支持模糊匹配 |
| 票务未发布 | isReleased = false | 先发布票务 |
| 票务库存不足 | availableQuantity < quantity | 减少购买数量 |
| 输入参数无效 | 必填字段缺失 | 检查title、price等字段 |

## 🧪 快速测试

### 创建票务
```bash
curl -X POST http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation CreateTicket($input: TicketInput!) { createTicket(input: $input) { id uni256 title price } }","variables":{"input":{"title":"测试票务","price":100,"totalQuantity":50,"isReleased":true}}}'
```

### 模糊查询票务
```bash
curl -X POST http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query GetTicket($uni256: String!) { ticket(uni256: $uni256) { id uni256 title price } }","variables":{"uni256":"ticket-1749032138919"}}'
```

### 查询所有票务
```bash
curl -X POST http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ tickets { id uni256 title price availableQuantity } }"}'
```

### 购买票务
```bash
curl -X POST http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation PurchaseTicket($uni256: String!, $quantity: Int) { purchaseTicket(uni256: $uni256, quantity: $quantity) { title availableQuantity soldQuantity } }","variables":{"uni256":"ticket-1749032138919","quantity":3}}'
```

## 📊 状态字段说明

| 字段 | 说明 | 影响 |
|------|------|------|
| `isReleased` | 是否发布 | 控制对外可见性 |
| `isEnabled` | 是否启用 | 控制可操作性 |
| `isSoldOut` | 是否售完 | 自动判断，基于库存 |
| `isExpired` | 是否过期 | 自动判断，基于时间 |

### 购买条件
✅ 同时满足才能购买：
- `isEnabled = true`
- `isReleased = true` 
- `isExpired = false`
- `availableQuantity > 0`

## 🆕 最新更新 (v1.2.0)

### ✨ uni256模糊查询
- 支持部分字符串匹配
- 忽略大小写
- 支持关键词搜索
- 适用于所有uni256查询接口

### 🔧 影响接口
- `ticket(uni256)` - 查询票务
- `purchaseTicket(uni256)` - 购买票务  
- `updateTicket(uni256)` - 更新票务
- `deleteTicket(uni256)` - 删除票务

## 📞 快速帮助

- 📖 完整文档: `TICKET_API_DOCS.md`
- 🛠️ 开发指南: `DEVELOPER_GUIDE.md`
- 📦 Postman集合: `Ticket_API_Postman_Collection.json`
- 🧪 测试脚本: `node test-tickets.js` 